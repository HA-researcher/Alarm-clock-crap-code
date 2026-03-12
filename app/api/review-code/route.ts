import { NextRequest, NextResponse } from "next/server";

// フロントから送られてくる body の型
interface ReviewCodeRequestBody {
  challengeTitle?: string;
  challengeTask?: string;
  originalCode?: string;
  patchedCode?: string;
  language?: string;
}

// Gemini に期待するレビュー結果の型
interface GeminiReviewResponse {
  passed: boolean;
  score: number;
  summary: string;
  strengths: string[];
  issues: Array<{
    title: string;
    detail: string;
  }>;
  feedback: string;
}

/**
 * AI の返答から JSON 文字列だけを取り出す関数
 */
function extractJsonBlock(text: string): string {
  const fencedMatch = text.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  const plainFencedMatch = text.match(/\`\`\`\s*([\s\S]*?)\`\`\`/i);
  if (plainFencedMatch?.[1]) {
    return plainFencedMatch[1].trim();
  }
  return text.trim();
}

/**
 * AI の返答を最低限安全な形に整える関数
 */
function normalizeReviewResponse(
  value: unknown,
  rawText?: string,
): GeminiReviewResponse & { rawText?: string } {
  const safe = value as Partial<GeminiReviewResponse>;

  return {
    passed: Boolean(safe?.passed),
    score:
      typeof safe?.score === "number"
        ? Math.max(0, Math.min(100, Math.round(safe.score)))
        : 0,
    summary:
      typeof safe?.summary === "string"
        ? safe.summary
        : "レビュー結果を要約できませんでした。",
    strengths: Array.isArray(safe?.strengths)
      ? safe.strengths.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
      : [],
    issues: Array.isArray(safe?.issues)
      ? safe.issues
        .map((issue) => {
          if (!issue || typeof issue !== "object") return null;
          const typed = issue as { title?: unknown; detail?: unknown };
          return {
            title:
              typeof typed.title === "string" && typed.title.length > 0
                ? typed.title
                : "指摘事項",
            detail:
              typeof typed.detail === "string" && typed.detail.length > 0
                ? typed.detail
                : "詳細を取得できませんでした。",
          };
        })
        .filter(
          (
            issue,
          ): issue is { title: string; detail: string } => issue !== null,
        )
      : [],
    feedback:
      typeof safe?.feedback === "string"
        ? safe.feedback
        : "再提出してください。",
    rawText,
  };
}

/**
 * Gemini が使えないとき用のフォールバック/モック判定
 */
function fallbackReview(
  originalCode: string,
  patchedCode: string,
): GeminiReviewResponse {
  // 元コードから変更されたか
  const changed = originalCode.trim() !== patchedCode.trim();

  // sort を使っているか
  const usesSort = /\.sort\s*\(/.test(patchedCode);

  // 数値比較の comparator があるか
  // 例: sort((a, b) => a - b)
  const usesNumericCompare =
    /sort\s*\(\s*\(\s*[a-zA-Z_]+\s*,\s*[a-zA-Z_]+\s*\)\s*=>\s*[a-zA-Z_]+\s*-\s*[a-zA-Z_]+\s*\)/.test(
      patchedCode,
    ) ||
    /sort\s*\(\s*function\s*\(\s*[a-zA-Z_]+\s*,\s*[a-zA-Z_]+\s*\)\s*\{\s*return\s+[a-zA-Z_]+\s*-\s*[a-zA-Z_]+\s*;?\s*\}\s*\)/.test(
      patchedCode,
    );

  // join(",") で文字列化しているか
  const usesJoinComma =
    /\.join\s*\(\s*["']\s*,\s*["']\s*\)/.test(patchedCode);

  // まず変更していなければ即不合格
  if (!changed) {
    return {
      passed: false,
      score: 10,
      summary: "コードが変更されていません。",
      strengths: [],
      issues: [
        {
          title: "未修正",
          detail: "元コードから変更が確認できませんでした。",
        },
      ],
      feedback:
        "numbers を sort((a, b) => a - b) で昇順ソートしてください。",
    };
  }

  const strengths: string[] = [];
  const issues: Array<{ title: string; detail: string }> = [];

  // 良い点と問題点を積み上げる
  if (usesSort) {
    strengths.push("sort を使って並び替え処理を入れようとしている点は良いです。");
  } else {
    issues.push({
      title: "sort 未使用",
      detail: "numbers の並び替え処理が見つかりませんでした。",
    });
  }

  if (usesNumericCompare) {
    strengths.push("文字列比較ではなく、数値比較の comparator を使えています。");
  } else {
    issues.push({
      title: "比較関数不足",
      detail:
        "sort() だけでは 10 と 2 の順序が崩れるため、(a, b) => a - b が必要です。",
    });
  }

  if (usesJoinComma) {
    strengths.push("最後に join(',') で文字列化できています。");
  } else {
    issues.push({
      title: "出力形式不一致",
      detail: "join(',') による文字列化が確認できませんでした。",
    });
  }

  // この問題では、合格条件を明確にしておく
  const passed = usesSort && usesNumericCompare && usesJoinComma;

  // スコアは簡易計算
  const score = passed ? 90 : Math.max(25, 90 - issues.length * 25);

  return {
    passed,
    score,
    summary: passed
      ? "要件どおり、数値の昇順ソートと文字列化ができています。"
      : "いくつか要件を満たしていません。再提出してください。",
    strengths,
    issues,
    feedback: passed
      ? "このまま monitoring に進めます。"
      : "numbers を sort((a, b) => a - b) で昇順ソートし、最後に join(',') してください。",
  };
}

/**
 * Gemini 本体にレビューさせる関数
 */
async function reviewWithGemini(
  apiKey: string,
  payload: Required<
    Pick<ReviewCodeRequestBody, "originalCode" | "patchedCode">
  > &
    ReviewCodeRequestBody,
): Promise<GeminiReviewResponse & { rawText?: string }> {
  const prompt = `
あなたは厳格だが建設的なコードレビュー担当です。
与えられた「元コード」と「提出コード」を比較し、提出コードが課題を満たすかを判定してください。

必ず JSON のみを返してください。Markdown や説明文は不要です。
返却 JSON の形式は次のとおりです:

{
  "passed": boolean,
  "score": number,
  "summary": string,
  "strengths": string[],
  "issues": [
    { "title": string, "detail": string }
  ],
  "feedback": string
}

判定ルール:
- passed は、本当に課題を満たしているときだけ true
- score は 0-100 の整数
- issues は failed のとき最低1件は入れる
- summary と feedback は日本語で簡潔に
- 課題未達なら甘くしない
- 構文エラーや未完成コードの可能性が高い場合は failed

課題タイトル:
${payload.challengeTitle ?? "未指定"}

課題内容:
${payload.challengeTask ?? "未指定"}

言語:
${payload.language ?? "javascript"}

元コード:
\`\`\`
${payload.originalCode}
\`\`\`

提出コード:
\`\`\`
${payload.patchedCode}
\`\`\`
`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const rawText =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("\n")
      .trim() ?? "";

  if (!rawText) {
    throw new Error("Gemini response was empty.");
  }

  const parsed = JSON.parse(extractJsonBlock(rawText)) as unknown;
  return normalizeReviewResponse(parsed, rawText);
}

// POST /api/review-code の本体
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReviewCodeRequestBody;
    const originalCode = body.originalCode?.trim() ?? "";
    const patchedCode = body.patchedCode?.trim() ?? "";

    // 必須データがなければレビューできない
    if (!originalCode || !patchedCode) {
      return NextResponse.json(
        { error: "originalCode と patchedCode は必須です。" },
        { status: 400 },
      );
    }

    const useMock = process.env.USE_MOCK_REVIEW === "true" || process.env.USE_MOCK_GEMINI === "true";
    const apiKey = process.env.GEMINI_API_KEY;

    // モックが有効、もしくはAPIキーが未設定の場合はフォールバックを使う
    if (useMock || !apiKey) {
      const fallback = fallbackReview(originalCode, patchedCode);
      return NextResponse.json(fallback);
    }

    try {
      const reviewed = await reviewWithGemini(apiKey, {
        ...body,
        originalCode,
        patchedCode,
      });

      return NextResponse.json(reviewed);
    } catch (error) {
      console.error("[review-code] gemini failed, fallback used:", error);
      const fallback = fallbackReview(originalCode, patchedCode);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("[review-code] unexpected error:", error);
    return NextResponse.json(
      { error: "レビュー処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
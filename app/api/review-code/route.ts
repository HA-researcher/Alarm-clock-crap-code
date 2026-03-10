// import { NextRequest, NextResponse } from "next/server";

// // フロントから送られてくる body の型
// interface ReviewCodeRequestBody {
//   challengeTitle?: string;
//   challengeTask?: string;
//   originalCode?: string;
//   patchedCode?: string;
//   language?: string;
// }

// // Gemini に期待するレビュー結果の型
// interface GeminiReviewResponse {
//   passed: boolean;
//   score: number;
//   summary: string;
//   strengths: string[];
//   issues: Array<{
//     title: string;
//     detail: string;
//   }>;
//   feedback: string;
// }

// /**
//  * AI の返答から JSON 文字列だけを取り出す関数
//  *
//  * AI はたまに
//  * ```json
//  * {...}
//  * ```
//  * のように返すことがある。
//  *
//  * そのままだと JSON.parse できないので、
//  * 中の {...} だけを取り出す。
//  */
// function extractJsonBlock(text: string): string {
//   // ```json ... ``` の形に対応
//   const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
//   if (fencedMatch?.[1]) {
//     return fencedMatch[1].trim();
//   }

//   // ``` ... ``` の形にも対応
//   const plainFencedMatch = text.match(/```\s*([\s\S]*?)```/i);
//   if (plainFencedMatch?.[1]) {
//     return plainFencedMatch[1].trim();
//   }

//   // フェンスが無ければそのまま返す
//   return text.trim();
// }

// /**
//  * AI の返答は時々微妙に形が崩れることがある。
//  * そのため、最低限安全な形に整える関数。
//  */
// function normalizeReviewResponse(
//   value: unknown,
//   rawText?: string,
// ): GeminiReviewResponse & { rawText?: string } {
//   const safe = value as Partial<GeminiReviewResponse>;

//   return {
//     // Boolean に強制変換
//     passed: Boolean(safe?.passed),

//     // score は 0〜100 の整数に丸める
//     score:
//       typeof safe?.score === "number"
//         ? Math.max(0, Math.min(100, Math.round(safe.score)))
//         : 0,

//     // summary が無ければデフォルト文
//     summary:
//       typeof safe?.summary === "string"
//         ? safe.summary
//         : "レビュー結果を要約できませんでした。",

//     // strengths が配列なら、文字列だけ残す
//     strengths: Array.isArray(safe?.strengths)
//       ? safe.strengths.filter(
//           (item): item is string => typeof item === "string" && item.length > 0,
//         )
//       : [],

//     // issues も安全に整形
//     issues: Array.isArray(safe?.issues)
//       ? safe.issues
//           .map((issue) => {
//             // 変な値なら捨てる
//             if (!issue || typeof issue !== "object") {
//               return null;
//             }

//             const typed = issue as { title?: unknown; detail?: unknown };

//             return {
//               // title が無ければ仮タイトル
//               title:
//                 typeof typed.title === "string" && typed.title.length > 0
//                   ? typed.title
//                   : "指摘事項",

//               // detail が無ければ仮説明
//               detail:
//                 typeof typed.detail === "string" && typed.detail.length > 0
//                   ? typed.detail
//                   : "詳細を取得できませんでした。",
//             };
//           })
//           .filter(
//             (
//               issue,
//             ): issue is {
//               title: string;
//               detail: string;
//             } => issue !== null,
//           )
//       : [],

//     // feedback も無ければデフォルト文
//     feedback:
//       typeof safe?.feedback === "string"
//         ? safe.feedback
//         : "再提出してください。",

//     // AI生レスポンスも残しておく
//     rawText,
//   };
// }

// /**
//  * Gemini が使えないとき用の簡易判定
//  *
//  * ハッカソンでは API エラーで全部止まるのが最悪なので、
//  * 「最低限のフォールバック」を用意しておく。
//  */
// function fallbackReview(
//   originalCode: string,
//   patchedCode: string,
// ): GeminiReviewResponse {
//   // まず元コードから変化しているかを確認
//   const changed = originalCode.trim() !== patchedCode.trim();

//   // とても雑だが、sort っぽい修正が入っていれば
//   // 最低限の改善ありとみなす
//   const hasSortHint =
//     /sort\s*\(/.test(patchedCode) ||
//     /numbers\s*=\s*\[\.\.\.numbers\]/.test(patchedCode) ||
//     /return\s+.*join\(/.test(patchedCode);

//   if (changed && hasSortHint) {
//     return {
//       passed: true,
//       score: 78,
//       summary: "最低限の修正は確認できました。",
//       strengths: [
//         "元コードから変更が入っています。",
//         "並び替えを試みる実装が含まれています。",
//       ],
//       issues: [],
//       feedback: "ハッカソン用フォールバック判定で合格です。",
//     };
//   }

//   return {
//     passed: false,
//     score: changed ? 45 : 10,
//     summary: "修正内容がまだ不足しています。",
//     strengths: changed ? ["元コードからの変更は確認できました。"] : [],
//     issues: [
//       {
//         title: "修正不足",
//         detail:
//           changed
//             ? "並び替えの意図が十分に確認できませんでした。"
//             : "元コードからほとんど変更が確認できませんでした。",
//       },
//     ],
//     feedback: "sort を使うなど、昇順で返す処理を明示してください。",
//   };
// }

// /**
//  * Gemini 本体にレビューさせる関数
//  */
// async function reviewWithGemini(
//   apiKey: string,
//   payload: Required<
//     Pick<ReviewCodeRequestBody, "originalCode" | "patchedCode">
//   > &
//     ReviewCodeRequestBody,
// ): Promise<GeminiReviewResponse & { rawText?: string }> {
//   // AI への指示文
//   // 「JSONだけ返せ」とかなり強く指定している
//   const prompt = `
// あなたは厳格だが建設的なコードレビュー担当です。
// 与えられた「元コード」と「提出コード」を比較し、提出コードが課題を満たすかを判定してください。

// 必ず JSON のみを返してください。Markdown や説明文は不要です。
// 返却 JSON の形式は次のとおりです:

// {
//   "passed": boolean,
//   "score": number,
//   "summary": string,
//   "strengths": string[],
//   "issues": [
//     { "title": string, "detail": string }
//   ],
//   "feedback": string
// }

// 判定ルール:
// - passed は、本当に課題を満たしているときだけ true
// - score は 0-100 の整数
// - issues は failed のとき最低1件は入れる
// - summary と feedback は日本語で簡潔に
// - 課題未達なら甘くしない
// - 構文エラーや未完成コードの可能性が高い場合は failed

// 課題タイトル:
// ${payload.challengeTitle ?? "未指定"}

// 課題内容:
// ${payload.challengeTask ?? "未指定"}

// 言語:
// ${payload.language ?? "javascript"}

// 元コード:
// \`\`\`
// ${payload.originalCode}
// \`\`\`

// 提出コード:
// \`\`\`
// ${payload.patchedCode}
// \`\`\`
// `.trim();

//   // Gemini API を直接呼ぶ
//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [{ text: prompt }],
//           },
//         ],
//         generationConfig: {
//           // 温度低め = 判定ブレを減らす
//           temperature: 0.2,

//           // JSON で返してほしい
//           responseMimeType: "application/json",
//         },
//       }),
//       cache: "no-store",
//     },
//   );

//   // API が失敗したら例外
//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Gemini API error: ${response.status} ${errorText}`);
//   }

//   // 返答を JSON として受け取る
//   const data = (await response.json()) as {
//     candidates?: Array<{
//       content?: {
//         parts?: Array<{
//           text?: string;
//         }>;
//       };
//     }>;
//   };

//   // 実際の本文を取り出す
//   const rawText =
//     data.candidates?.[0]?.content?.parts
//       ?.map((part) => part.text ?? "")
//       .join("\n")
//       .trim() ?? "";

//   if (!rawText) {
//     throw new Error("Gemini response was empty.");
//   }

//   // JSON 部分だけ取り出して parse
//   const parsed = JSON.parse(extractJsonBlock(rawText)) as unknown;

//   // 崩れた形でも安全に整形して返す
//   return normalizeReviewResponse(parsed, rawText);
// }

// // POST /api/review-code の本体
// export async function POST(request: NextRequest) {
//   try {
//     // フロントから送られた body を読む
//     const body = (await request.json()) as ReviewCodeRequestBody;

//     // 前後の空白を除去
//     const originalCode = body.originalCode?.trim();
//     const patchedCode = body.patchedCode?.trim();

//     // 必須項目が無ければ 400 エラー
//     if (!originalCode || !patchedCode) {
//       return NextResponse.json(
//         { error: "originalCode と patchedCode は必須です。" },
//         { status: 400 },
//       );
//     }

//     // 環境変数から API キーを取得
//     const apiKey = process.env.GEMINI_API_KEY;

//     // APIキーが無いならフォールバック判定
//     if (!apiKey) {
//       const fallback = fallbackReview(originalCode, patchedCode);
//       return NextResponse.json(fallback);
//     }

//     try {
//       // まずは本命の Gemini 判定
//       const reviewed = await reviewWithGemini(apiKey, {
//         ...body,
//         originalCode,
//         patchedCode,
//       });

//       return NextResponse.json(reviewed);
//     } catch (error) {
//       // Gemini が失敗しても API 全体を落とさず、
//       // フォールバックへ逃がす
//       console.error("[review-code] gemini failed, fallback used:", error);
//       const fallback = fallbackReview(originalCode, patchedCode);
//       return NextResponse.json(fallback);
//     }
//   } catch (error) {
//     // 想定外のエラー
//     console.error("[review-code] unexpected error:", error);

//     return NextResponse.json(
//       { error: "レビュー処理中にエラーが発生しました。" },
//       { status: 500 },
//     );
//   }
// }



import { NextRequest, NextResponse } from "next/server";

interface ReviewCodeRequestBody {
  challengeTitle?: string;
  challengeTask?: string;
  originalCode?: string;
  patchedCode?: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const useMock = process.env.USE_MOCK_REVIEW === "true";

    if (!useMock) {
      return NextResponse.json(
        { error: "USE_MOCK_REVIEW=true にしてください。" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ReviewCodeRequestBody;
    const originalCode = body.originalCode?.trim() ?? "";
    const patchedCode = body.patchedCode?.trim() ?? "";

    if (!originalCode || !patchedCode) {
      return NextResponse.json(
        { error: "originalCode と patchedCode は必須です。" },
        { status: 400 },
      );
    }

    const changed = originalCode !== patchedCode;

    // 今回の課題用の簡易採点条件
    const usesSort = /\.sort\s*\(/.test(patchedCode);
    const usesNumericCompare =
      /sort\s*\(\s*\(\s*[a-zA-Z_]+\s*,\s*[a-zA-Z_]+\s*\)\s*=>\s*[a-zA-Z_]+\s*-\s*[a-zA-Z_]+\s*\)/.test(
        patchedCode,
      ) ||
      /sort\s*\(\s*function\s*\(\s*[a-zA-Z_]+\s*,\s*[a-zA-Z_]+\s*\)\s*\{\s*return\s+[a-zA-Z_]+\s*-\s*[a-zA-Z_]+\s*;?\s*\}\s*\)/.test(
        patchedCode,
      );

    const returnsJoin = /\.join\s*\(\s*["'`],[\"'`]\s*\)|\.join\s*\(\s*["'`],[\"'`]?\s*\)|\.join\s*\(\s*["'`],[\"'`]\s*\)/.test(
      patchedCode,
    ) || /\.join\s*\(\s*["'`],[\"'`]?\s*\)/.test(patchedCode);

    if (!changed) {
      return NextResponse.json({
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
          "sort の比較関数を追加して、数値として昇順ソートする実装に直してください。",
      });
    }

    const issues: Array<{ title: string; detail: string }> = [];
    const strengths: string[] = [];

    if (usesSort) {
      strengths.push("sort を使って並び替えをしようとしている点は良いです。");
    } else {
      issues.push({
        title: "sort 未使用",
        detail: "並び替え処理が見つかりませんでした。",
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

    if (returnsJoin) {
      strengths.push("最終的にカンマ区切り文字列へ変換できています。");
    } else {
      issues.push({
        title: "出力形式不一致",
        detail: "join(',') による文字列化が確認できませんでした。",
      });
    }

    const passed = usesSort && usesNumericCompare && returnsJoin;
    const score = passed ? 90 : Math.max(25, 90 - issues.length * 25);

    return NextResponse.json({
      passed,
      score,
      summary: passed
        ? "要件どおり、数値の昇順ソートと文字列化ができています。"
        : "いくつか要件を満たしていません。再提出してください。",
      strengths,
      issues,
      feedback: passed
        ? "このまま monitoring に進めます。"
        : "比較関数つきの sort と join(',') を見直してください。",
    });
  } catch (error) {
    console.error("[review-code] mock API error:", error);

    return NextResponse.json(
      { error: "レビュー処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
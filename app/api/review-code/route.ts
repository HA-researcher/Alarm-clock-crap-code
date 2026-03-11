import { NextResponse } from "next/server";
import { getGenAI } from "@/lib/gemini";

const SYSTEM_PROMPT = `
あなたは「目覚ましクソコード」アプリのコードレビューAIです。
ユーザーが提出したコードが、元のクソコードから「少しでも改善されているか」を判定します。

【判定基準】
- 合格: 元のコードからバグ修正・可読性改善・パフォーマンス改善のいずれかが確認できる
- 不合格: コードが元のまま変更されていない
- 不合格: 構文エラーがある（実行不可能なコード）
- 不合格: 逆に悪化している

【重要な姿勢】
- 厳格すぎず、朝起きたばかりのユーザーを応援する立場で判定する
- 完璧なリファクタリングでなくても、1箇所でも改善があれば合格にしてよい
- ただし「変更なし」は絶対に不合格

【出力形式】
必ずJSONのみで出力。JSON以外の文章は禁止。
{
  "is_passed": true または false,
  "message": "日本語のフィードバック（100文字以内）"
}
`;

export async function POST(req: Request) {
  try {
    const ai = getGenAI();
    const body = await req.json() as {
      originalCode: string;
      userCode: string;
      language: string;
    };

    const { originalCode, userCode, language } = body;

    if (!originalCode || !userCode || !language) {
      return NextResponse.json(
        { error: "originalCode, userCode, language are required" },
        { status: 400 }
      );
    }

    const prompt = `
プログラミング言語: ${language}

【元のクソコード】
\`\`\`
${originalCode}
\`\`\`

【ユーザーが修正したコード】
\`\`\`
${userCode}
\`\`\`

上記の元コードとユーザーのコードを比較して、改善されているか判定してください。
`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const text = result.text ?? "";
    const parsed = JSON.parse(text) as { is_passed: boolean; message: string };

    return NextResponse.json({
      is_passed: Boolean(parsed.is_passed),
      message: typeof parsed.message === "string" ? parsed.message : "",
    });
  } catch (err) {
    console.error("[review-code] error:", err);
    return NextResponse.json(
      { is_passed: false, message: "レビューに失敗しました。もう一度試してください。" },
      { status: 500 }
    );
  }
}

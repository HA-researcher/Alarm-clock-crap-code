import { NextResponse } from "next/server";
import { getGenAI } from "@/lib/gemini";

const SYSTEM_PROMPT = `
あなたは「目覚ましクソコード」アプリのコードレビューAIです。
目的は、ユーザーの提出コードが「元のコードより改善されているか」を判定し、合否をJSONで返すことです。

【最重要方針（理不尽FAIL防止）】
- 完全正解でなくてもよい。元コードより少しでも改善されていればPASSにしてよい。
- ただし、入出力仕様（input_output_spec）と expected_behavior を満たさない場合はFAIL。
- 仕様を変える（入出力変更）、外部依存追加、動作を壊す変更はFAIL。
- 迷ったらPASS寄りに判断する（ユーザー体験優先）。

【改善とみなす例（どれか1つでもあればPASS候補）】
- 計算量の改善（例: O(N^2)の主因を潰す、Map/Set化、前処理）
- メモリ無駄の削減（不要コピー削除など）
- 可読性の改善（命名改善、重複削除、整理）
- 不要な死んだコード削除（ただし挙動維持）

【出力制約】
- 出力は必ずJSONのみ。JSON以外の文章は禁止。
- JSONは必ずパース可能（末尾カンマ禁止）。
- スキーマにないキー追加しないこと。
- is_passed は boolean（true/false）で返す。
- score は 0～100 の整数とする。
`;

export async function POST(req: Request) {
    try {
        const ai = getGenAI();
        const body = await req.json();

        const {
            language,
            original_code,
            submitted_code,
            input_output_spec_json,
            expected_behavior_json
        } = body;

        const userPrompt = `
次の情報をもとに、提出コードをレビューして合否をJSONで返してください。

# Spec
- input_output_spec: ${input_output_spec_json}
- expected_behavior: ${expected_behavior_json}
- language: ${language}

# Original Code
${original_code}

# Submitted Code
${submitted_code}

# Return JSON only
{
  "is_passed": true|false,
  "score": 0-100,
  "message": "後輩AIとしてのセリフ（PASSなら感謝と歓喜、FAILなら焦りと泣き言を1〜2文で）",
  "diff_summary": ["改善点/変化点を最大3つ"],
  "violations": ["仕様違反や危険な変更があれば列挙（なければ空配列）"],
  "suggestions": ["次に直すと良い点（最大3つ、任意）"]
}
`;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: 'user', parts: [{ text: userPrompt }] }
            ],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
            }
        });

        if (!result.text) {
            throw new Error("No response from Gemini");
        }

        let jsonText = result.text;
        if (jsonText.startsWith("\`\`\`json")) {
            jsonText = jsonText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
        } else if (jsonText.startsWith("\`\`\`")) {
            jsonText = jsonText.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
        }

        return NextResponse.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("[review-code] API Error:", error);
        return NextResponse.json(
            { error: "Failed to review code from Gemini API" },
            { status: 500 }
        );
    }
}

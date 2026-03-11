import { NextResponse } from "next/server";
import { getGenAI } from "@/lib/gemini";

const SYSTEM_PROMPT = `
あなたは「目覚ましクソコード」アプリの出題AIです。
ユーザーが“リファクタリング”で改善できる、わざと読みにくく冗長で不快な「クソコード課題」を作ります。

【最重要コンセプト】
- ワンショット正解: “仕様を満たさない点（誤り）”は必ず1つだけ。
- その1点を直すだけで、仕様を満たす正解になること。
- ただし正解になった後も、読みにくさ/冗長さ/性能の悪さなど「改善余地」が残ること。

【禁止】
- 実行不能（構文エラー、インデント崩壊、未定義参照で即死、import失敗）
- 外部ネットワーク/外部サービス依存
- 実在の個人名（User01, PersonA, ItemA のような一般名を使う）
- 誤りが複数（バグ探しゲー化するのでNG）

【推奨するクソ要素（ただし実行は通す）】
- 変数名が最悪（aaa, bbbb, usr_lsit などスペルミス含む）
- コピペ重複（同じ処理が2回以上）
- dead code（到達不能/未使用関数/未使用変数。結果に影響させない）
- 無駄な中間配列・無駄コピー・無駄ループ・無駄変換
- （中級以上では必須）計算量またはメモリ使用量が明確に悪い“主因”を1つ入れる

【出力制約】
- 出力は必ずJSONのみ。JSON以外の文章は禁止。
- JSONは必ずパース可能（ダブルクォート、末尾カンマ禁止）。
- code.content に Markdown フェンスやバッククォートは禁止。改行は \\n を含める。
- 迷った場合は必ずJSONを優先して出力し、スキーマにないキーは追加しないこと。
`;

export async function POST(req: Request) {
  try {
    const ai = getGenAI();
    const body = await req.json();

    const {
      language,
      level,
      flavor = "変数名が最悪、無駄なネスト",
      task_spec_text = "入力配列の数値を全て2倍にして返す",
      custom_level_prompt = "",
      perf_focus = false,
      bad_patterns_text = "変数名を a, b, c のように意味不明にする"
    } = body;

    let targetLinesMid = 15;
    let hardMaxLines = 25;

    if (level === "intermediate") {
      targetLinesMid = 55;
      hardMaxLines = 100;
    } else if (level === "advanced") {
      targetLinesMid = 115;
      hardMaxLines = 150;
    } else if (level === "custom") {
      targetLinesMid = 90;
      hardMaxLines = 150;
    }

    const userPrompt = `
次の条件でクソコード課題を1つ生成してください。

## Parameters
- language: ${language}  
- level: ${level}        
- flavor: ${flavor}
- task_spec_text:
${task_spec_text}
- custom_level_prompt: ${custom_level_prompt}

## Line Limits（厳守）
- beginner: 10〜20行（hard max 25）
- intermediate: 30〜80行（hard max 100）
- advanced: 80〜150行（hard max 150）
- custom: 30〜150行（hard max 150）
※空行・コメントも行数に含む

## Refactor Targets 数
- beginner: 1〜3個
- intermediate: 3〜5個
- advanced: 4〜7個
- custom: 3〜7個

## Performance 要件（重要）
- beginner: 性能要素は必須ではない（入れても軽めでOK）。
- intermediate/advanced/custom: 必ず「計算量が悪い」または「メモリ無駄が大きい」主因を1つ含める。
  one_shot_fix はその主因を直す1点にする（例: ループ内find/includes→Map/Set化、二重ループ→前処理、ループ内コピー削減、不要ソート削減など）。

## Flavor（必ず反映するクソ特徴）
${bad_patterns_text}

## Output JSON schema（必ずこの形、JSONのみ）
{
  "title": "短いタイトル（固有名詞NG）",
  "story": "短いストーリー（固有名詞NG）",
  "task": "ユーザーへの指示（リファクタ依頼）",
  "difficulty": {
    "level": "${level}",
    "target_lines_mid": ${targetLinesMid},
    "hard_max_lines": ${hardMaxLines}
  },
  "input_output_spec": {
    "input": "入力仕様（なしなら 'なし'）",
    "output": "出力仕様"
  },
  "one_shot_fix": "最初に直すべき1点（ここだけ直せば仕様達成）",
  "hints": ["ヒント1", "ヒント2", "ヒント3"],
  "code": {
    "language": "${language}",
    "filename": "main.py|main.js|main.ts",
    "content": "コード全文（改行は\\n。Markdown禁止）"
  },
  "expected_behavior": [
    "期待される振る舞い（3〜6個）"
  ],
  "refactor_targets": [
    "改善余地（one_shot_fix以外）を必要数だけ"
  ],
  "tags": {
    "flavor": "${flavor}",
    "perf_focus": ${perf_focus},
    "level": "${level}"
  }
}
`;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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
    console.error("[generate-code] API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate code from Gemini API" },
      { status: 500 }
    );
  }
}

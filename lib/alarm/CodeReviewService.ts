// 画面から API に送るデータの型
export interface ReviewCodeRequest {
  // 課題タイトル
  challengeTitle?: string;

  // 課題の説明文
  challengeTask?: string;

  // 修正前の元コード
  originalCode: string;

  // ユーザーが修正して提出したコード
  patchedCode: string;

  // 言語。今回は javascript を入れる想定
  language?: string;
}

// AI が返す「問題点」1件分の型
export interface ReviewIssue {
  title: string;
  detail: string;
}

// API から返ってくるレビュー結果の型
export interface ReviewCodeResponse {
  // 合格かどうか
  passed: boolean;

  // 点数
  score: number;

  // 一言要約
  summary: string;

  // 良かった点
  strengths: string[];

  // 指摘事項
  issues: ReviewIssue[];

  // 総合コメント
  feedback: string;

  // AI生レスポンスをあとで見たくなる可能性があるので任意で持てるようにしている
  rawText?: string;
}

export class CodeReviewService {
  // 実際に API を呼ぶ関数
  static async reviewCode(
    payload: ReviewCodeRequest,
  ): Promise<ReviewCodeResponse> {
    // Next.js の API Route を叩く
    const response = await fetch("/api/review-code", {
      method: "POST",
      headers: {
        // JSON を送ることを明示
        "Content-Type": "application/json",
      },
      // JavaScript のオブジェクトを JSON 文字列に変換して送る
      body: JSON.stringify(payload),
    });

    // 返ってきた JSON を受け取る
    const data = (await response.json()) as
      | ReviewCodeResponse
      | { error?: string };

    // HTTP ステータスが 200 系でなければエラー扱い
    if (!response.ok) {
      throw new Error(
        "error" in data && data.error
          ? data.error
          : "レビューAPIの呼び出しに失敗しました。",
      );
    }

    // 正常ならレビュー結果を返す
    return data as ReviewCodeResponse;
  }
}
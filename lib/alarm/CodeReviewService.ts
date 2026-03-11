export interface ReviewCodeParams {
    language: string;
    original_code: string;
    submitted_code: string;
    input_output_spec_json: string;
    expected_behavior_json: string;
}

export interface ReviewResult {
    is_passed: boolean;
    score: number;
    message: string;
    diff_summary: string[];
    violations: string[];
    suggestions?: string[];
}

export class CodeReviewService {
    /**
     * Gemini APIを呼び出して、提出されたコードのレビュー（合否判定）を行います。
     */
    static async reviewCode(params: ReviewCodeParams): Promise<ReviewResult> {
        const response = await fetch("/api/review-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to fetch review result from API");
        }

        const data = await response.json();
        return data as ReviewResult;
    }
}

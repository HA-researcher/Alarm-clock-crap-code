export interface GenerateCodeParams {
    language: string;
    level: string;
    flavor?: string;
    task_spec_text?: string;
    custom_level_prompt?: string;
    perf_focus?: boolean;
    bad_patterns_text?: string;
}

export interface GeneratedChallenge {
    title: string;
    story: string;
    task: string;
    difficulty: {
        level: string;
        target_lines_mid: number;
        hard_max_lines: number;
    };
    input_output_spec: {
        input: string;
        output: string;
    };
    one_shot_fix: string;
    hints: string[];
    code: {
        language: string;
        filename: string;
        content: string;
    };
    expected_behavior: string[];
    refactor_targets: string[];
    tags: {
        flavor: string;
        perf_focus: boolean;
        level: string;
    };
}

export class CodeGeneratorService {
    /**
     * Gemini APIを呼び出して、クソコード課題を生成します。
     */
    static async fetchCrapCode(params: GenerateCodeParams): Promise<GeneratedChallenge> {
        const response = await fetch("/api/generate-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to fetch generated code from API");
        }

        const data = await response.json();
        return data as GeneratedChallenge;
    }
}

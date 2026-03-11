import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { CodeReviewService } from '../CodeReviewService';

describe('CodeReviewService', () => {
    const mockParams = {
        language: 'javascript',
        original_code: 'function add(a,b){return a+b;}',
        submitted_code: 'const add = (a, b) => a + b;',
        input_output_spec_json: '[]',
        expected_behavior_json: '[]'
    };

    const mockResponse = {
        is_passed: true,
        score: 85,
        message: '合格 🎉',
        diff_summary: ['変数名修正'],
        violations: [],
        suggestions: []
    };

    beforeEach(() => {
        // Reset global fetch before each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('reviewCode successful case', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await CodeReviewService.reviewCode(mockParams);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/review-code', expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockParams),
        }));

        expect(result).toEqual(mockResponse);
        expect(result.is_passed).toBe(true);
    });

    test('reviewCode API error case', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid API Key' }),
        });

        await expect(CodeReviewService.reviewCode(mockParams)).rejects.toThrow('Invalid API Key');
    });

    test('reviewCode generic HTTP error case', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => { throw new Error('Syntax error'); },
        });

        await expect(CodeReviewService.reviewCode(mockParams)).rejects.toThrow('Failed to fetch review result from API');
    });
});

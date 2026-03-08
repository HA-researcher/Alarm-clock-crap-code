import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export function getGenAI(): GoogleGenAI {
    if (!ai) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return ai;
}

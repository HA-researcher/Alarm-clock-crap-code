"use client";

import { useState } from "react";
import { PROGRAMMING_LANGUAGES, DIFFICULTY_LEVELS } from "@/lib/constants/config";

interface ChallengeConfigProps {
  selectedLanguage: string;
  difficulty: string;
  customProblem: string;
  onLanguageChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onCustomProblemChange: (value: string) => void;
}

export default function ChallengeConfig({
  selectedLanguage,
  difficulty,
  customProblem,
  onLanguageChange,
  onDifficultyChange,
  onCustomProblemChange,
}: ChallengeConfigProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-green-400 mb-4">チャレンジ設定</h2>
      
      {/* プログラミング言語 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          プログラミング言語
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400 cursor-pointer"
        >
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-gray-700">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* 難易度 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          難易度
        </label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400 cursor-pointer"
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level.value} value={level.value} className="bg-gray-700">
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* カスタム問題 */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          difficulty === "custom" 
            ? "max-h-40 opacity-100 mb-4" 
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            カスタム問題
          </label>
          <textarea
            value={customProblem}
            onChange={(e) => onCustomProblemChange(e.target.value)}
            placeholder="ここに問題を入力してください..."
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none placeholder-gray-400 transition-all duration-200 hover:border-green-400 focus:border-green-500"
          />
        </div>
      </div>
    </div>
  );
}

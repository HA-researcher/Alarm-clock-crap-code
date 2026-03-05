export const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "scala", label: "Scala" },
  { value: "r", label: "R" },
  { value: "sql", label: "SQL" },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: "easy", label: "かんたん", description: "朝でも解ける優しい問題" },
  { value: "medium", label: "ふつう", description: "適度に頭を使う問題" },
  { value: "hard", label: "むずかしい", description: "本気で考えないと解けない問題" },
  { value: "custom", label: "カスタム", description: "自分で問題を用意" },
] as const;

export type ProgrammingLanguage = typeof PROGRAMMING_LANGUAGES[number]["value"];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]["value"];

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
  { value: "easy", label: "Easy", description: "Simple problems for morning coding" },
  { value: "medium", label: "Medium", description: "Moderately challenging problems" },
  { value: "hard", label: "Hard", description: "Problems that require serious thought" },
  { value: "custom", label: "Custom", description: "Create your own challenge" },
] as const;

export type ProgrammingLanguage = typeof PROGRAMMING_LANGUAGES[number]["value"];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]["value"];

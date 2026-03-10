// モック用の課題データ型
export interface MockChallenge {
  id: string;
  title: string;
  story: string;
  task: string;
  oneShotFix: string;
  expectedBehavior: string[];
  language: string;
  starterCode: string;
}

// モック課題一覧
// 今回は 1 問だけ置いておけば十分
export const mockChallenges: MockChallenge[] = [
  {
    id: "sort-csv-numbers-001",
    title: "CSV文字列を数値として昇順ソートせよ",
    story:
      "後輩ちゃんが CSV 文字列を数値配列に変換するところまでは実装できたのですが、昇順ソートを入れ忘れました。",
    task:
      "input で受け取ったカンマ区切り文字列を数値配列へ変換し、数値として昇順に並べて、最後にカンマ区切り文字列で返してください。",
    oneShotFix:
      "numbers を sort((a, b) => a - b) で数値として昇順ソートすること。",
    expectedBehavior: [
      `"3,1,2" -> "1,2,3"`,
      `"10,2,1" -> "1,2,10"`,
      `"3, x, 2" -> "2,3"`,
    ],
    language: "typescript",
    starterCode: `export function solve(input: string): string {
  const numbers = input
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));

  // TODO: numbers を昇順に並べて返してください
  return numbers.join(",");
}
`,
  },
];
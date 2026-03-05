export const challengePrompt = `
次の関数 \`solve\` を完成させてください。

- 入力: カンマ区切りの整数文字列 (例: "3,1,2")
- 出力: 昇順に並べたカンマ区切り文字列 (例: "1,2,3")
`;

export const starterCode = `export function solve(input: string): string {
  const numbers = input
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));

  // TODO: numbers を昇順に並べて返してください
  return numbers.join(",");
}
`;

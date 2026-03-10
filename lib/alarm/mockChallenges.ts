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

export const mockChallenges: MockChallenge[] = [
  {
    id: "sort-numbers-001",
    title: "数字配列を昇順ソートせよ",
    story:
      "後輩ちゃんが、数字配列を昇順に並べる関数を書いたつもりですが、うまく動きません。",
    task:
      "submitされたコードが、numbers 配列を昇順に並べてカンマ区切り文字列で返すように修正してください。",
    oneShotFix:
      "sort(compareFn) を正しく使って、数値として昇順ソートすること。",
    expectedBehavior: [
      "[3,1,2] -> '1,2,3'",
      "[10,2,1] -> '1,2,10'",
      "元の意図がわかる読みやすいコードになっていること",
    ],
    language: "javascript",
    starterCode: `export function solve(numbers) {
  // TODO: 数字を昇順にして "1,2,3" のような文字列を返す
  return numbers.sort().join(",");
}
`,
  },
];
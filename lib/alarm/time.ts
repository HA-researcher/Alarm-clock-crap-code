// lib/alarm/time.ts

// "HH:mm" 形式の文字列から、次に来るアラーム日時を生成する関数
// 例:
//   現在 06:50 / alarmTime = "07:00" → 今日の 07:00
//   現在 07:10 / alarmTime = "07:00" → 明日の 07:00
export function buildNextAlarmDate(alarmTime: string): Date | null {
  if (!alarmTime) return null;

  const [hourText, minuteText] = alarmTime.split(":");
  const hours = Number(hourText);
  const minutes = Number(minuteText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const now = new Date();
  const target = new Date();

  // 今日の日付に対して、設定した時刻をセットする
  target.setHours(hours, minutes, 0, 0);

  // すでにその時刻を過ぎていたら、次の日の同時刻として扱う
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

// 残りミリ秒を "HH:mm:ss" 形式に整形する
export function formatRemainingTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// 目標時刻を日本語の日時表示に整形する
export function formatTargetTime(date: Date): string {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// components/AlarmAudioController.tsx

"use client";

import { useAlarmStore } from "@/stores/alarmStore";
import { useAlarmAudio } from "@/lib/alarm/useAlarmAudio";

/**
 * アプリ全体の state を監視して、
 * 必要なときだけ PCブラウザ側のアラーム音を鳴らすための controller。
 *
 * challenge ページに閉じず、layout 常駐にすることで
 * route 遷移の有無にかかわらず停止・再開が効くようにする。
 */
export function AlarmAudioController() {
  const appState = useAlarmStore((state) => state.state);

  // 既存 store に volume がある前提。
  // もし alarmVolume という名前なら、ここだけ読み替えてください。
  const volume = useAlarmStore((state) => state.volume ?? 50);

  useAlarmAudio(appState, volume);

  return null;
}
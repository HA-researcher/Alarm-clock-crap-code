// lib/alarm/audioManager.ts

/**
 * PCブラウザ側のアラーム音を管理する薄いマネージャ。
 *
 * 今回は Issue #21 の最小達成を優先し、
 * HTMLAudioElement ではなく Web Audio API でビープ音を鳴らす。
 *
 * 理由:
 * - 音源ファイル未配置でも動く
 * - ループや停止が簡単
 * - ハッカソン中に詰まりにくい
 *
 * 将来的に public/alarm.mp3 に差し替える場合も、
 * UI側はこの manager を呼ぶだけにしておけば差し替えやすい。
 */

let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let oscillator: OscillatorNode | null = null;
let pulseTimer: number | null = null;

// ブラウザの自動再生制約を解除できたかどうか
let unlocked = false;

// 現在の音量を内部保持しておく
let currentVolume = 50;

/**
 * AudioContext を lazily に生成する。
 * 必要になるまで作らないことで、SSRや不要な初期化を避ける。
 */
function ensureAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  return audioContext;
}

/**
 * 0〜100 の volume を Web Audio API 用に 0〜1 に丸める。
 */
function normalizeVolume(volume: number): number {
  const safe = Math.max(0, Math.min(100, volume));
  return safe / 100;
}

/**
 * 初回ユーザー操作後に呼ぶ。
 * これで iOS / Chrome 系の autoplay 制約に引っかかりにくくする。
 */
export async function unlockAlarmAudio(): Promise<boolean> {
  const ctx = ensureAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    unlocked = ctx.state === "running";
    return unlocked;
  } catch (error) {
    console.error("[audioManager] unlock failed:", error);
    unlocked = false;
    return false;
  }
}

/**
 * 今の解除状態を外から読めるようにする。
 * デバッグやUI表示に使いたい場合に便利。
 */
export function isAlarmAudioUnlocked(): boolean {
  return unlocked;
}

/**
 * 現在アラーム音が鳴っているかどうか。
 */
export function isAlarmAudioPlaying(): boolean {
  return oscillator !== null;
}

/**
 * 実際に鳴らす音量を適用する。
 * 生の volume をそのまま使うと大きすぎることがあるため、少し抑える。
 */
function getEffectiveGain(volume: number): number {
  return normalizeVolume(volume) * 0.25;
}

/**
 * アラーム再生開始。
 *
 * 仕様:
 * - unlock 済みでない場合は何もしない
 * - 二重開始を避ける
 * - 単調すぎる連続音ではなく、パルス的に鳴らす
 */
export function startAlarmAudio(volume: number): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  currentVolume = volume;

  // 自動再生制約が解除されていない場合は再生しない
  if (!unlocked) {
    console.warn("[audioManager] start skipped: audio is locked");
    return;
  }

  // すでに鳴っているなら重複再生しない
  if (oscillator || gainNode) {
    updateAlarmVolume(volume);
    return;
  }

  gainNode = ctx.createGain();
  gainNode.gain.value = 0;
  gainNode.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  oscillator.connect(gainNode);
  oscillator.start();

  const onGain = getEffectiveGain(volume);
  let isOn = false;

  // ループっぽく聞こえるよう 250ms ごとにON/OFFする
  pulseTimer = window.setInterval(() => {
    if (!gainNode || !audioContext) return;

    isOn = !isOn;
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setTargetAtTime(
      isOn ? onGain : 0,
      audioContext.currentTime,
      0.01
    );
  }, 250);
}

/**
 * 鳴っている音の音量だけ更新する。
 */
export function updateAlarmVolume(volume: number): void {
  currentVolume = volume;

  if (!gainNode || !audioContext) return;

  gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  gainNode.gain.setTargetAtTime(
    getEffectiveGain(volume),
    audioContext.currentTime,
    0.01
  );
}

/**
 * アラーム停止。
 *
 * Issue #21 の「cleared / force_stopped で確実に止まる」を担保する
 * 重要な関数なので、例外が出ても落ちにくいようにしている。
 */
export function stopAlarmAudio(): void {
  if (pulseTimer !== null) {
    window.clearInterval(pulseTimer);
    pulseTimer = null;
  }

  if (oscillator) {
    try {
      oscillator.stop();
    } catch (error) {
      // すでに stop 済みでも落とさない
      console.warn("[audioManager] oscillator stop warning:", error);
    }

    try {
      oscillator.disconnect();
    } catch (error) {
      console.warn("[audioManager] oscillator disconnect warning:", error);
    }

    oscillator = null;
  }

  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch (error) {
      console.warn("[audioManager] gain disconnect warning:", error);
    }

    gainNode = null;
  }
}
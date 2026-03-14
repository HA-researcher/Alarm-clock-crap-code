"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function useSleepDetection(
    onSleepDetected: () => void,
    onAwakeDetected: () => void,
    onFaceDetected: () => void,
    isEnabled: boolean
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // State refs for the interval loop
    const faceMissingTicks = useRef(0);
    const eyeClosedTicks = useRef(0);
    const isPenaltyRef = useRef(false);

    // 新規: 顔あり・開眼ありの連続検知用カウンター
    const facePresentTicks = useRef(0);
    const eyesOpenTicks = useRef(0);

    // 新規: 同じ成功イベントを連続で発火しないための状態管理
    // penalty 解除後や初回安定検知時に、ログを毎フレーム連打しないために使う
    const lastStableStateRef = useRef<"unknown" | "active" | "penalty">("unknown");

    // 新規: callback を ref 化して、初期化 effect の再実行を防ぐ
    const onSleepDetectedRef = useRef(onSleepDetected);
    const onAwakeDetectedRef = useRef(onAwakeDetected);
    const onFaceDetectedRef = useRef(onFaceDetected);

    useEffect(() => {
        onSleepDetectedRef.current = onSleepDetected;
    }, [onSleepDetected]);

    useEffect(() => {
        onAwakeDetectedRef.current = onAwakeDetected;
    }, [onAwakeDetected]);

    useEffect(() => {
        onFaceDetectedRef.current = onFaceDetected;
    }, [onFaceDetected]);

    // Constants for 5fps loop
    const LOOP_INTERVAL_MS = 200;
    const FACE_MISSING_THRESHOLD_TICKS = 15; // 3 seconds @ 5fps
    const EYE_CLOSED_THRESHOLD_TICKS = 50; // 10 seconds @ 5fps
    const EYE_CLOSED_SCORE_THRESHOLD = 0.4; // Blendshape score threshold

    // 新規: Nフレームでの安定判定
    const FACE_PRESENT_THRESHOLD_TICKS = 3; // 0.6 seconds @ 5fps
    const EYES_OPEN_THRESHOLD_TICKS = 3; // 0.6 seconds @ 5fps
    const RECOVERY_THRESHOLD_TICKS = 3; // penalty解除の安定判定

    useEffect(() => {
        let active = true;
        let stream: MediaStream | null = null;
        let intervalId: number | null = null;

        // 新規: 睡眠検知がOFFなら初期化せず終了
        if (!isEnabled) {
            setIsInitializing(false);
            return () => {
                if (intervalId !== null) clearInterval(intervalId);
                if (stream) stream.getTracks().forEach(t => t.stop());
                landmarkerRef.current = null;
            };
        }

        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.19/wasm"
                );
                landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1,
                });

                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current && active) {
                    videoRef.current.srcObject = stream;

                    // 新規: metadata 読み込みと再生開始を待ってから推論を始める
                    await videoRef.current.play().catch((err) => {
                        console.warn("video play failed:", err);
                    });
                }

                if (active) {
                    setIsInitializing(false);
                    startLoop();
                }
            } catch (err) {
                console.error("Failed to initialize MediaPipe:", err);
                if (active) {
                    setIsInitializing(false);
                }
            }
        };

        const startLoop = () => {
            intervalId = window.setInterval(() => {
                const video = videoRef.current;
                const landmarker = landmarkerRef.current;

                if (!video || !landmarker) {
                    return;
                }

                // 新規: readyState だけでは不十分なため、再生状態と実フレームサイズも確認する
                if (
                    video.readyState < 2 ||
                    video.paused ||
                    video.ended ||
                    video.videoWidth === 0 ||
                    video.videoHeight === 0
                ) {
                    return;
                }

                let results: ReturnType<FaceLandmarker["detectForVideo"]> | null = null;

                try {
                    // 新規: detectForVideo は動画初期化直後に落ちることがあるため防御する
                    results = landmarker.detectForVideo(video, performance.now());
                } catch (err) {
                    console.warn("detectForVideo failed:", err);
                    return;
                }

                if (!results.faceBlendshapes || results.faceBlendshapes.length === 0) {
                    // Face missing
                    faceMissingTicks.current++;
                    facePresentTicks.current = 0;
                    eyesOpenTicks.current = 0;

                    if (faceMissingTicks.current >= FACE_MISSING_THRESHOLD_TICKS) {
                        triggerPenalty();
                    }
                    return;
                }

                // Face detected
                faceMissingTicks.current = 0;
                facePresentTicks.current++;

                const blendshapes = results.faceBlendshapes[0].categories;
                const leftEyeBlink = blendshapes.find(b => b.categoryName === "eyeBlinkLeft")?.score ?? 0;
                const rightEyeBlink = blendshapes.find(b => b.categoryName === "eyeBlinkRight")?.score ?? 0;

                if (leftEyeBlink > EYE_CLOSED_SCORE_THRESHOLD && rightEyeBlink > EYE_CLOSED_SCORE_THRESHOLD) {
                    eyeClosedTicks.current++;
                    eyesOpenTicks.current = 0;

                    if (eyeClosedTicks.current >= EYE_CLOSED_THRESHOLD_TICKS) {
                        triggerPenalty();
                    }
                } else {
                    // Eyes open
                    eyeClosedTicks.current = 0;
                    eyesOpenTicks.current++;

                    // 新規: penalty 中は、顔あり + 開眼あり を Nフレーム連続で確認したら解除
                    if (isPenaltyRef.current) {
                        if (
                            facePresentTicks.current >= RECOVERY_THRESHOLD_TICKS &&
                            eyesOpenTicks.current >= RECOVERY_THRESHOLD_TICKS
                        ) {
                            resolvePenalty();
                        }
                        return;
                    }

                    // 新規: 通常監視中でも、顔あり + 開眼あり を Nフレーム連続で確認したら通知する
                    if (
                        facePresentTicks.current >= FACE_PRESENT_THRESHOLD_TICKS &&
                        eyesOpenTicks.current >= EYES_OPEN_THRESHOLD_TICKS
                    ) {
                        reportFaceDetected();
                    }
                }
            }, LOOP_INTERVAL_MS);
        };

        const triggerPenalty = () => {
            if (!isPenaltyRef.current) {
                isPenaltyRef.current = true;
                lastStableStateRef.current = "penalty";
                onSleepDetectedRef.current();
            }
        };

        const resolvePenalty = () => {
            if (isPenaltyRef.current) {
                isPenaltyRef.current = false;
                eyeClosedTicks.current = 0;
                faceMissingTicks.current = 0;
                lastStableStateRef.current = "active";
                onAwakeDetectedRef.current();
            }
        };

        // 新規: 通常状態での「顔あり」通知
        // 連打を避けるため、active に遷移した最初の1回だけ発火させる
        const reportFaceDetected = () => {
            if (lastStableStateRef.current !== "active") {
                lastStableStateRef.current = "active";
                onFaceDetectedRef.current();
            }
        };

        init();

        return () => {
            active = false;
            if (intervalId !== null) clearInterval(intervalId);
            if (stream) stream.getTracks().forEach(t => t.stop());
            // MediaPipe FaceLandmarker doesn't have a close() method
            // Just set to null for cleanup
            landmarkerRef.current = null;
        };
    }, [isEnabled]);

    return { videoRef, isInitializing };
}
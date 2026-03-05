"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function useSleepDetection(onSleepDetected: () => void, onAwakeDetected: () => void) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // State refs for the interval loop
    const faceMissingTicks = useRef(0);
    const eyeClosedTicks = useRef(0);
    const isPenaltyRef = useRef(false);

    // Constants for 5fps loop
    const LOOP_INTERVAL_MS = 200;
    const FACE_MISSING_THRESHOLD_TICKS = 15; // 3 seconds @ 5fps
    const EYE_CLOSED_THRESHOLD_TICKS = 50; // 10 seconds @ 5fps
    const EYE_CLOSED_SCORE_THRESHOLD = 0.4; // Blendshape score threshold

    useEffect(() => {
        let active = true;
        let stream: MediaStream | null = null;
        let intervalId: number | null = null;

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
                }

                if (active) {
                    setIsInitializing(false);
                    startLoop();
                }
            } catch (err) {
                console.error("Failed to initialize MediaPipe:", err);
            }
        };

        const startLoop = () => {
            intervalId = window.setInterval(() => {
                if (!videoRef.current || !landmarkerRef.current || videoRef.current.readyState < 2) {
                    return;
                }

                const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());

                if (!results.faceBlendshapes || results.faceBlendshapes.length === 0) {
                    // Face missing
                    faceMissingTicks.current++;
                    if (faceMissingTicks.current >= FACE_MISSING_THRESHOLD_TICKS) {
                        triggerPenalty();
                    }
                } else {
                    // Face detected
                    faceMissingTicks.current = 0;
                    const blendshapes = results.faceBlendshapes[0].categories;
                    const leftEyeBlink = blendshapes.find(b => b.categoryName === "eyeBlinkLeft")?.score ?? 0;
                    const rightEyeBlink = blendshapes.find(b => b.categoryName === "eyeBlinkRight")?.score ?? 0;

                    if (leftEyeBlink > EYE_CLOSED_SCORE_THRESHOLD && rightEyeBlink > EYE_CLOSED_SCORE_THRESHOLD) {
                        eyeClosedTicks.current++;
                        if (eyeClosedTicks.current >= EYE_CLOSED_THRESHOLD_TICKS) {
                            triggerPenalty();
                        }
                    } else {
                        // Eyes open
                        eyeClosedTicks.current = 0;
                        if (isPenaltyRef.current) {
                            resolvePenalty();
                        }
                    }
                }
            }, LOOP_INTERVAL_MS);
        };

        const triggerPenalty = () => {
            if (!isPenaltyRef.current) {
                isPenaltyRef.current = true;
                onSleepDetected();
            }
        };

        const resolvePenalty = () => {
            if (isPenaltyRef.current) {
                isPenaltyRef.current = false;
                onAwakeDetected();
            }
        };

        init();

        return () => {
            active = false;
            if (intervalId !== null) clearInterval(intervalId);
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (landmarkerRef.current) landmarkerRef.current.close();
        };
    }, [onSleepDetected, onAwakeDetected]);

    return { videoRef, isInitializing };
}

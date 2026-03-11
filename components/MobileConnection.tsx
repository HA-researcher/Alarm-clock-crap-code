"use client";

import { QRCodeSVG } from "qrcode.react";
import { useAlarmStore } from "@/stores/alarmStore";

interface MobileConnectionProps {
  state: string;
}

export default function MobileConnection({ state }: MobileConnectionProps) {
  const roomId = useAlarmStore((s) => s.roomId);

  return (
    <div className="space-y-6">
      {/* Mobile Connection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-4">モバイル連携</h2>

        {/* QRコード領域 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            QRコード
          </label>
          <div className="w-full flex items-center justify-center bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-md py-4">
            {roomId ? (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    value={roomId}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
                <p className="text-xs text-gray-500 font-mono break-all max-w-[180px] text-center">
                  {roomId}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  アラームを設定すると<br />QRコードが表示されます
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 状態表示 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-4">ステータス</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-300">現在の状態:</span>
            <span className="text-sm font-medium text-green-400">{state}</span>
          </div>

          {state === "cleared" && (
            <div className="mt-3 p-3 bg-green-900/50 border border-green-700 rounded-md">
              <p className="text-sm text-green-300">
                ✅ チャレンジクリア。次のアラームを設定できます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

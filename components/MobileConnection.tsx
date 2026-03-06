"use client";

import QRCodeIcon from "./QRCodeIcon";

interface MobileConnectionProps {
  state: string;
}

export default function MobileConnection({ state }: MobileConnectionProps) {
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
          <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-700/50">
            <div className="text-center">
              <QRCodeIcon />
              <p className="text-gray-400 text-sm">QRコードがここに表示されます</p>
            </div>
          </div>
        </div>

        {/* 合言葉 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            合言葉
          </label>
          <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-center">
            <span className="text-green-400 font-mono text-lg">ABC123</span>
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

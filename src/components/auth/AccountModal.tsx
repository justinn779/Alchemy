import { useState } from 'react';
import type { User } from 'firebase/auth';

interface AccountModalProps {
  user: User;
  displayName: string;
  gold: number;
  discoveredCount: number;
  worldFirstCount: number;
  onClose: () => void;
  onSignOut: () => void;
}

export function AccountModal({
  user,
  displayName,
  gold,
  discoveredCount,
  worldFirstCount,
  onClose,
  onSignOut,
}: AccountModalProps) {
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-void-600 bg-void-800 p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!confirmingSignOut ? (
          <>
            <div className="text-3xl">{user.isAnonymous ? '🧪' : '🧙'}</div>
            <h2 className="mt-2 font-display text-xl text-parchment-200">{displayName}</h2>
            <p className="mt-1 text-xs text-parchment-300/50">
              {user.isAnonymous ? '試玩模式（尚未登入）' : (user.email ?? '已登入')}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-void-900 py-2">
                <div className="text-parchment-200">🪙 {gold}</div>
                <div className="mt-1 text-parchment-300/50">金幣</div>
              </div>
              <div className="rounded-lg bg-void-900 py-2">
                <div className="text-parchment-200">📖 {discoveredCount}</div>
                <div className="mt-1 text-parchment-300/50">圖鑑</div>
              </div>
              <div className="rounded-lg bg-void-900 py-2">
                <div className="text-parchment-200">🌟 {worldFirstCount}</div>
                <div className="mt-1 text-parchment-300/50">世界首創</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              className="mt-5 w-full rounded-lg border border-void-600 bg-void-900 px-4 py-2 text-sm text-parchment-300/80 transition hover:bg-void-700"
            >
              登出
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-lg px-4 py-2 text-sm text-parchment-300/50 transition hover:text-parchment-300/80"
            >
              關閉
            </button>
          </>
        ) : (
          <>
            <div className="text-3xl">⚠️</div>
            <h2 className="mt-2 font-display text-xl text-parchment-200">確定要登出嗎？</h2>
            <p className="mt-2 text-sm text-parchment-300/70">
              {user.isAnonymous
                ? '試玩模式的煉成成果不會保留，登出後將完全消失。'
                : '登出後可以隨時用同一個帳號再登入。'}
            </p>
            <button
              type="button"
              onClick={onSignOut}
              className="mt-4 w-full rounded-lg bg-ember-500 px-4 py-2 text-sm font-medium text-void-950 transition hover:bg-ember-400"
            >
              確定登出
            </button>
            <button
              type="button"
              onClick={() => setConfirmingSignOut(false)}
              className="mt-2 w-full rounded-lg px-4 py-2 text-sm text-parchment-300/50 transition hover:text-parchment-300/80"
            >
              取消
            </button>
          </>
        )}
      </div>
    </div>
  );
}

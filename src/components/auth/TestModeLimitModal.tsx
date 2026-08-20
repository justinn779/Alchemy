import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TEST_MODE_ACTION_LIMIT } from '@/types/models';

export function TestModeLimitModal() {
  const { linkWithGoogle, error } = useAuth();
  const [pending, setPending] = useState(false);

  const handleLogin = async () => {
    setPending(true);
    try {
      await linkWithGoogle();
    } catch {
      // error surfaced via auth context state
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xs rounded-2xl border border-void-600 bg-void-800 p-6 text-center shadow-xl">
        <div className="text-3xl">🔒</div>
        <h2 className="mt-2 font-display text-xl text-parchment-200">試玩已達上限</h2>
        <p className="mt-2 text-sm text-parchment-300/70">
          試玩模式最多 {TEST_MODE_ACTION_LIMIT} 次煉成/萃取。登入 Google 帳號即可繼續遊玩，並開始正式收集你的圖鑑。
        </p>
        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-arcane-500 px-4 py-2 text-sm font-medium text-void-950 transition hover:bg-arcane-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? '登入中…' : '使用 Google 登入'}
        </button>
        {error && <p className="mt-2 text-xs text-ember-400">{error}</p>}
      </div>
    </div>
  );
}

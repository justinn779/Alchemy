import { useState } from 'react';
import { setInventorTitleApi } from '@/services/functionsApi';

export function InventorTitleModal({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = title.trim();
  const canSubmit = trimmed.length >= 1 && trimmed.length <= 20 && !pending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      await setInventorTitleApi(trimmed);
      onDone();
    } catch {
      setError('設定失敗，請稍後再試一次。');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xs rounded-2xl border border-void-600 bg-void-800 p-6 text-center shadow-xl">
        <div className="text-3xl">✨</div>
        <h2 className="mt-2 font-display text-xl text-parchment-200">歡迎，煉金術士</h2>
        <p className="mt-2 text-sm text-parchment-300/70">
          幫自己取一個發明家稱號吧——以後你發明或發現的每個素材，都會掛上這個名字。
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSubmit();
          }}
          placeholder="例如：星塵煉金師"
          maxLength={20}
          autoFocus
          className="mt-4 w-full rounded-lg border border-void-600 bg-void-900 px-3 py-2 text-center text-sm text-parchment-200 placeholder:text-parchment-300/30 focus:border-arcane-400 focus:outline-none"
        />
        {error && <p className="mt-2 text-xs text-ember-400">{error}</p>}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="mt-4 w-full rounded-lg bg-arcane-500 px-4 py-2 text-sm font-medium text-void-950 transition hover:bg-arcane-400 disabled:cursor-not-allowed disabled:bg-void-700 disabled:text-parchment-300/40"
        >
          {pending ? '設定中…' : '開始煉成'}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 27 35.8 24 35.8c-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export function LoginScreen() {
  const { signInWithGoogle, signInAsGuest, error } = useAuth();
  const [pending, setPending] = useState<'google' | 'guest' | null>(null);

  const handleGoogle = async () => {
    setPending('google');
    try {
      await signInWithGoogle();
    } catch {
      // error is surfaced via auth context state
    } finally {
      setPending(null);
    }
  };

  const handleGuest = async () => {
    setPending('guest');
    try {
      await signInAsGuest();
    } catch {
      // error is surfaced via auth context state
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-void-950 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-4xl tracking-wide text-parchment-200 sm:text-5xl">
          萬象爐 <span className="text-arcane-400">EverForge</span>
        </h1>
        <p className="max-w-sm text-sm text-parchment-300/70 sm:text-base">
          從水、火、土、風、雷出發，煉成屬於你的萬千概念。
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={pending !== null}
          className="flex items-center justify-center gap-3 rounded-xl border border-void-600 bg-parchment-200 px-6 py-3 font-medium text-void-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {pending === 'google' ? '登入中…' : '使用 Google 登入'}
        </button>

        <button
          type="button"
          onClick={handleGuest}
          disabled={pending !== null}
          className="rounded-xl border border-void-600 bg-void-800 px-6 py-3 font-medium text-parchment-200 transition hover:bg-void-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === 'guest' ? '登入中…' : '跳過，先試玩看看'}
        </button>
        <p className="text-xs text-parchment-300/40">
          試玩模式最多可煉成/萃取 30 次，成果不會保留；準備好了再登入正式開始收集。
        </p>
      </div>

      {error && <p className="text-sm text-ember-400">{error}</p>}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useGameBootstrap } from '@/hooks/useGameBootstrap';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCollection } from '@/hooks/useCollection';
import { useCombine } from '@/hooks/useCombine';
import { useExtract } from '@/hooks/useExtract';
import { useCombineHistory } from '@/hooks/useCombineHistory';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { CombinePanel } from '@/components/game/CombinePanel';
import { ElementList } from '@/components/game/ElementList';
import { CombineResultModal } from '@/components/game/CombineResultModal';
import { CollectionPage } from '@/components/game/CollectionPage';
import { ElementDetailModal } from '@/components/game/ElementDetailModal';
import { HistoryPanel } from '@/components/game/HistoryPanel';
import { MANA_CONFIG } from '@/types/models';
import type { CollectionEntry } from '@/types/view';

type Tab = 'combine' | 'collection';

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-arcane-400 border-t-transparent" />
    </div>
  );
}

function GameHome({ uid }: { uid: string }) {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile(uid);
  const { entries, loading: collectionLoading, discoveredCount, worldFirstCount } =
    useCollection(uid);
  const combine = useCombine();
  const extract = useExtract();
  const history = useCombineHistory(uid);
  const [tab, setTab] = useState<Tab>('combine');
  const [detailEntry, setDetailEntry] = useState<CollectionEntry | null>(null);

  const manaAvailable = (profile?.mana ?? 0) >= MANA_CONFIG.COMBINE_COST;
  const extractManaAvailable = (profile?.mana ?? 0) >= MANA_CONFIG.EXTRACT_COST;
  const selectedIds = new Set(
    [combine.slotA?.id, combine.slotB?.id].filter((id): id is string => Boolean(id)),
  );
  const activeResult = combine.result ?? extract.result;
  const dismissActiveResult = combine.result ? combine.dismissResult : extract.dismissResult;

  const ownedIds = useMemo(() => new Set(entries.map((e) => e.element.id)), [entries]);
  const elementsCache = useMemo(
    () => new Map(entries.map((e) => [e.element.id, e.element])),
    [entries],
  );

  return (
    <div className="min-h-screen bg-void-950 px-4 py-6 text-parchment-200 sm:px-8">
      <header className="mx-auto flex max-w-3xl flex-col gap-3 border-b border-void-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">
            萬象爐 <span className="text-arcane-400">EverForge</span>
          </h1>
          <p className="text-xs text-parchment-300/60">
            {user?.isAnonymous
              ? '訪客煉金術士'
              : (profile?.displayName ?? user?.displayName ?? '煉金術士')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span title="Mana">
            🔮 {profile?.mana ?? '—'} / {profile?.maxMana ?? '—'}
          </span>
          <span title="Gold">🪙 {profile?.gold ?? '—'}</span>
          <span title="圖鑑數量">📖 {discoveredCount}</span>
          <span title="世界首創">🌟 {worldFirstCount}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-void-600 bg-void-800 px-3 py-1.5 text-xs transition hover:bg-void-700"
          >
            登出
          </button>
        </div>
      </header>

      <nav className="mx-auto mt-4 flex max-w-3xl gap-2">
        <button
          type="button"
          onClick={() => setTab('combine')}
          className={`rounded-lg px-4 py-1.5 text-sm transition ${
            tab === 'combine'
              ? 'bg-arcane-500 text-void-950'
              : 'bg-void-800 text-parchment-300/70 hover:bg-void-700'
          }`}
        >
          煉成
        </button>
        <button
          type="button"
          onClick={() => setTab('collection')}
          className={`rounded-lg px-4 py-1.5 text-sm transition ${
            tab === 'collection'
              ? 'bg-arcane-500 text-void-950'
              : 'bg-void-800 text-parchment-300/70 hover:bg-void-700'
          }`}
        >
          圖鑑
        </button>
      </nav>

      <main className="mx-auto mt-6 flex max-w-3xl flex-col gap-8">
        {tab === 'combine' ? (
          <>
            <CombinePanel
              slotA={combine.slotA}
              slotB={combine.slotB}
              pending={combine.pending}
              manaAvailable={manaAvailable}
              error={combine.error}
              onClearA={combine.clearSlotA}
              onClearB={combine.clearSlotB}
              onCombine={() => void combine.combine()}
              extractPending={extract.pending}
              extractManaAvailable={extractManaAvailable}
              extractError={extract.error}
              onExtract={() => {
                if (combine.slotA) void extract.extract(combine.slotA.id);
              }}
            />

            <section>
              <p className="mb-3 text-xs text-parchment-300/50">
                點選元素放入上方的煉成格，選滿兩個後即可煉成。
              </p>
              {collectionLoading ? (
                <p className="text-sm text-parchment-300/60">載入圖鑑中…</p>
              ) : (
                <ElementList
                  entries={entries}
                  onPick={combine.pickElement}
                  selectedIds={selectedIds}
                />
              )}
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium text-parchment-300/50">
                最近合成（點擊元素放入煉成格）
              </h2>
              <HistoryPanel
                history={history}
                elementsCache={elementsCache}
                onPick={combine.pickElement}
              />
            </section>
          </>
        ) : collectionLoading ? (
          <p className="text-sm text-parchment-300/60">載入圖鑑中…</p>
        ) : (
          <CollectionPage
            entries={entries}
            discoveredCount={discoveredCount}
            worldFirstCount={worldFirstCount}
            onSelect={setDetailEntry}
          />
        )}
      </main>

      {activeResult && (
        <CombineResultModal result={activeResult} onClose={dismissActiveResult} />
      )}
      {detailEntry && (
        <ElementDetailModal
          entry={detailEntry}
          ownedIds={ownedIds}
          elementsCache={elementsCache}
          onClose={() => setDetailEntry(null)}
        />
      )}
    </div>
  );
}

function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const bootstrapStatus = useGameBootstrap(user?.uid ?? null);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (bootstrapStatus === 'pending' || bootstrapStatus === 'idle') {
    return <LoadingSpinner />;
  }

  if (bootstrapStatus === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-void-950 px-6 text-center">
        <p className="text-sm text-ember-400">初始化玩家資料失敗，請重新整理頁面再試一次。</p>
      </div>
    );
  }

  return <GameHome uid={user.uid} />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;

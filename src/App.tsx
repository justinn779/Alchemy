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
import { InventorTitleModal } from '@/components/auth/InventorTitleModal';
import { TestModeLimitModal } from '@/components/auth/TestModeLimitModal';
import { CombinePanel } from '@/components/game/CombinePanel';
import { ElementList } from '@/components/game/ElementList';
import { CombineResultModal } from '@/components/game/CombineResultModal';
import { CollectionPage } from '@/components/game/CollectionPage';
import { ElementDetailModal } from '@/components/game/ElementDetailModal';
import { HistoryPanel } from '@/components/game/HistoryPanel';
import { TEST_MODE_ACTION_LIMIT } from '@/types/models';
import type { CollectionEntry } from '@/types/view';
import type { ElementDoc } from '@/types/models';

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
  const isTestMode = user?.isAnonymous ?? false;

  // Test mode never persists to Firestore, so nothing accumulates there —
  // this local-only list lets the player keep building on what they just
  // made within the session, purely client-side.
  const [testModeElements, setTestModeElements] = useState<CollectionEntry[]>([]);
  const addTestModeElement = (view: {
    resultElement: ElementDoc;
    isWorldFirst: boolean;
    isDiscoverer: boolean;
  }) => {
    setTestModeElements((prev) => {
      if (prev.some((e) => e.element.id === view.resultElement.id)) return prev;
      return [
        {
          element: view.resultElement,
          discoveredAt: Date.now(),
          isWorldFirst: view.isWorldFirst,
          isDiscoverer: view.isDiscoverer,
        },
        ...prev,
      ];
    });
  };

  const combine = useCombine(addTestModeElement);
  const extract = useExtract(addTestModeElement);
  const history = useCombineHistory(uid);
  const [tab, setTab] = useState<Tab>('combine');
  const [detailEntry, setDetailEntry] = useState<CollectionEntry | null>(null);

  const selectedIds = new Set(
    [combine.slotA?.id, combine.slotB?.id].filter((id): id is string => Boolean(id)),
  );
  const activeResult = combine.result ?? extract.result;
  const dismissActiveResult = combine.result ? combine.dismissResult : extract.dismissResult;
  const mode: 'combine' | 'extract' =
    combine.slotA && combine.slotB ? 'combine' : 'extract';
  const extractSource = combine.slotA ?? combine.slotB;
  const testModeLimitReached = combine.testModeLimitReached || extract.testModeLimitReached;

  const effectiveEntries = isTestMode ? [...testModeElements, ...entries] : entries;
  const effectiveDiscoveredCount = isTestMode ? effectiveEntries.length : discoveredCount;
  const effectiveWorldFirstCount = isTestMode
    ? testModeElements.filter((e) => e.isWorldFirst).length
    : worldFirstCount;

  const ownedIds = useMemo(
    () => new Set(effectiveEntries.map((e) => e.element.id)),
    [effectiveEntries],
  );
  const elementsCache = useMemo(
    () => new Map(effectiveEntries.map((e) => [e.element.id, e.element])),
    [effectiveEntries],
  );

  const pickForCombine = (element: ElementDoc) => {
    combine.pickElement(element);
    setTab('combine');
  };

  return (
    <div className="min-h-screen bg-void-950 px-4 py-6 text-parchment-200 sm:px-8">
      <header className="mx-auto flex max-w-3xl flex-col gap-3 border-b border-void-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">
            萬象爐 <span className="text-arcane-400">EverForge</span>
          </h1>
          <p className="text-xs text-parchment-300/60">
            {user?.isAnonymous
              ? '試玩中的煉金術士'
              : (profile?.displayName ?? user?.displayName ?? '煉金術士')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {user?.isAnonymous && (
            <span
              title="試玩次數"
              className="rounded-full border border-void-600 px-2 py-0.5 text-xs text-parchment-300/60"
            >
              🧪 {profile?.testActionCount ?? 0}/{TEST_MODE_ACTION_LIMIT}
            </span>
          )}
          <span title="Gold">🪙 {profile?.gold ?? '—'}</span>
          <span title="圖鑑數量">📖 {effectiveDiscoveredCount}</span>
          <span title="世界首創">🌟 {effectiveWorldFirstCount}</span>
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
              mode={mode}
              pending={combine.pending || extract.pending}
              error={combine.error ?? extract.error}
              onClearA={combine.clearSlotA}
              onClearB={combine.clearSlotB}
              onAction={() => {
                if (combine.slotA && combine.slotB) {
                  void combine.combine();
                } else if (extractSource) {
                  void extract.extract(extractSource.id).then((completed) => {
                    if (completed) {
                      combine.clearSlotA();
                      combine.clearSlotB();
                    }
                  });
                }
              }}
            />

            <section>
              <p className="mb-3 text-xs text-parchment-300/50">
                點擊元素直接放入煉成格；已選的格子點擊可移除；點左上角 i 可查看詳情。
              </p>
              {collectionLoading ? (
                <p className="text-sm text-parchment-300/60">載入圖鑑中…</p>
              ) : (
                <ElementList
                  entries={effectiveEntries}
                  onPick={combine.pickElement}
                  onInfoClick={setDetailEntry}
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
            entries={effectiveEntries}
            discoveredCount={effectiveDiscoveredCount}
            worldFirstCount={effectiveWorldFirstCount}
            onPick={pickForCombine}
            onInfoClick={setDetailEntry}
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
          onAddToSlot={(element) => {
            pickForCombine(element);
            setDetailEntry(null);
          }}
        />
      )}
      {testModeLimitReached && <TestModeLimitModal />}
    </div>
  );
}

function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const { status: bootstrapStatus, needsInventorTitle, clearNeedsInventorTitle } = useGameBootstrap(
    user?.uid ?? null,
    user?.isAnonymous ?? false,
  );

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

  if (needsInventorTitle) {
    return <InventorTitleModal onDone={clearNeedsInventorTitle} />;
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

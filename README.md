# 萬象爐 EverForge

AI 驅動的無限概念合成網頁遊戲。從水、火、土、風、雷五大元素出發，透過 AI 動態生成的合成結果，探索一個全球玩家共享、持續擴張的概念世界。

## 技術架構

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Firebase Cloud Functions (2nd gen, TypeScript)
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication（Google / 匿名登入）
- **AI**: OpenAI（透過 `AlchemyAIProvider` 抽象層，未來可切換 Gemini / Claude）
- **Hosting**: Firebase Hosting

## 核心機制

- **概念合成**：選擇兩個已擁有的元素進行「煉成」，AI 判斷合理的結果
- **Recipe Cache**：同一組合在全世界只呼叫一次 AI，之後皆讀取快取，並以 Firestore transaction 處理併發首次合成的競態問題
- **世界首創**：全服務器第一個創造出某元素的玩家會被永久記錄為 Creator
- **萃取 Extract**：從單一元素萃取出更本質的概念
- **圖鑑與血統**：搜尋 / 分類 / 排序、元素詳情、以及可追溯「這個元素是怎麼合成出來的」血統樹
- **合成歷史**：記錄最近的煉成紀錄，點擊可直接重新放入煉成格
- **Mana / Gold**：Mana 以 lazy calculation 隨時間回復，同時作為遊戲節奏與 AI 用量的天然限制

## 開發

```bash
npm install
npm run dev          # 前端開發伺服器

cd functions
npm install
npm run build         # 編譯 Cloud Functions
```

### Firebase Emulator

```bash
firebase emulators:start
```

### 部署

```bash
npm run build
firebase deploy
```

需先以 `firebase functions:secrets:set OPENAI_API_KEY` 設定 AI provider 的 API key。

## 專案結構

```
src/                  # 前端 React app
  components/         # UI 元件（auth / game / modals / layout）
  hooks/               # 資料與遊戲邏輯 hooks
  services/            # Firestore / Cloud Functions 呼叫封裝
  types/               # 前後端共用的 domain types（與 functions/src/types 同步）
functions/            # Cloud Functions 後端
  src/
    ai/                # LLM provider 抽象層
    domain/            # mana / gold / normalize / settlement 等核心邏輯
    repositories/       # Firestore 存取層
firestore.rules        # 安全規則：所有遊戲邏輯只能透過 Cloud Functions 修改
firestore.indexes.json
```

## 📘 [English](README.en.md) | 📙 [中文](README.zh.md)

# YouTube Summarizer v2

一個小而美的個人 YouTube 影片摘要與學習工具，支援 AI 摘要生成、字幕翻譯、重點標記與筆記管理。

只需貼上 YouTube 連結，即可快速了解內容、決定是否觀看或分類收藏。

與 AI Agent 一起深入分析影片、抽取重點並有效整理。

## 功能

- 🎯 **智能摘要**：用 GPT-3.5/Gemini 自動產生中英文摘要。
- 🔤 **字幕翻譯**：英文字幕即時轉為繁體中文。
- ✨ **重點標記**：標示片段並添加筆記。
- 📝 **筆記系統**：完整的筆記管理。
- 🔍 **全文搜尋**：檢索標題、字幕、摘要、筆記。
- 🎨 **現代介面**：響應式設計，支援手勢。
- 💬 **AI Agent**：影片問答與互動對話。

## 💬 AI Agent：與影片深度對話

### 如何運作？

1. 辨識你正在觀看的影片。
2. 取得資料庫中的關鍵資訊（標題、摘要、字幕）。
3. 傳送上下文＋提問給後端 LLM。
4. 回傳針對性回答。
5. 保存對話記錄，支援影片上下文延續討論。

### 與傳統 chatbot 差異

- 🚀 **超越關鍵字**  
- 🗣️ **像與專家對談**  
- 🧠 **具記憶能力**  
- ⏱️ **節省時間**

## 認證系統

- **登入方式**：
  - Google OAuth
  - 訪客模式
- **用戶管理**：
  - Supabase 使用者管理
  - 權限與 session 控制

## 使用說明

1. **擷取影片資訊**
2. **字幕處理**
3. **生成摘要**
4. **筆記管理**
5. **全文檢索**

## UI 特點

- 支援手機、桌機、4K
- 無障礙設計（ARIA、鍵盤操作、螢幕閱讀器）

## 技術棧

### 前端

- **框架**：Next.js 14  
- **語言**：TypeScript  
- **樣式**：Tailwind CSS  
- **狀態管理**：React Context  
- **UI**：Radix UI、手勢操作、動畫

### 後端

- **資料庫**：Supabase (PostgreSQL)
- **認證**：NextAuth.js
- **API**：Next.js API Routes
- **AI**：OpenAI GPT-3.5、Google Gemini

## 安裝方式

### 環境需求

- Node.js 18+
- npm 或 yarn
- Supabase 帳號
- OpenAI API 金鑰
- Google AI Studio 金鑰
- Google OAuth

### 安裝步驟

```bash
git clone https://github.com/joshhong30s/videoSummarizer.git
cd videoSummarizer
npm install
```

### 設定環境變數

```bash
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

OPENAI_API_KEY=your_openai_api_key
GOOGLESTUDIO_API_KEY=your_gemini_api_key
```

### 資料庫初始化

```bash
cd supabase
psql -h your-db-host -d postgres -U postgres -f init.sql
```

### 啟動伺服器

```bash
npm run dev
```

## 專案結構

```
.
├── app/
│   ├── api/
│   ├── auth/
│   ├── components/
│   └── video/
├── lib/
│   ├── contexts/
│   ├── hooks/
│   └── utils/
└── supabase/
    ├── migrations/
    └── functions/
```

## 授權條款

MIT

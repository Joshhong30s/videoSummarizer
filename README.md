# YouTube Summarizer v2

一個小而美的個人 YouTube 影片摘要和學習工具，支援 AI 摘要生成、字幕翻譯、重點標記和筆記功能。

## Features

- 🎯 **智能摘要**：使用 GPT-3.5/Gemini 自動生成影片摘要
- 🔤 **字幕翻譯**：英文字幕即時翻譯為繁體中文
- ✨ **重點標記**：標記重要段落並添加筆記
- 📝 **筆記系統**：完整的筆記管理功能
- 🔍 **內容搜尋**：全文檢索影片內容
- 🎨 **現代化界面**：響應式設計，支援手勢操作

## How to Use

1. **影片資訊擷取**
   - 支援 YouTube URL 解析
   - 自動擷取影片資訊和字幕
2. **字幕處理**
   - 自動分段和格式化
   - 支援字幕編輯和手動上傳
   - 字幕翻譯
   - 支援顏色標計行字幕
3. **摘要生成**
   - 支援多語言摘要
   - 可選擇 GPT-3.5 或 Gemini 模型
4. **筆記系統**
   - CRUD筆記
   - 下載markdown格式筆記

5. **搜尋功能**
   - 全文檢索(影片標題/字幕/摘要/筆記)

## Stacks

### Frontend

- **框架**: Next.js 14
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: React Context
- **UI 元件**:
  - Radix UI 基礎元件
  - 自定義動畫和過渡效果
  - 手勢支援

### Backend

- **數據庫**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **AI 服務**:
  - OpenAI GPT-3.5
  - Google Gemini

## Setup

### Prerequisites

- Node.js 18+
- npm 或 yarn
- Supabase 帳號
- OpenAI API Key
- Google AI Studio API Key

### Installation

1. clone

```bash
git clone https://github.com/joshhong30s/videoSummarizer.git
cd videoSummarizer
```

2. dependencies

```bash
npm install
```

3. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_GOOGLESTUDIO_API_KEY=your_gemini_api_key
```

4. Database Setup

- 開啟一個Supabase專案
- 執行資料庫遷移：

```bash
cd supabase
psql -h your-db-host -d postgres -U postgres -f init.sql
```

5. Start Production Server

```bash
npm run dev
```

## Project Structure

```
.
├── app/                 # Next.js App Router 結構
│   ├── api/            # API 路由
│   ├── components/     # 共用元件
│   └── video/         # 影片相關頁面
├── lib/                # 共用邏輯和工具
│   ├── contexts/      # React Contexts
│   ├── hooks/         # 自定義 Hooks
│   └── utils/         # 工具函數
└── supabase/          # Supabase 相關配置
    ├── migrations/    # 資料庫遷移
    └── functions/     # Supabase Functions
```

## License

MIT

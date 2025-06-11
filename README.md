# YouTube Summarizer v2

一個小而美的個人 YouTube 影片摘要和學習工具，支援 AI 摘要生成、字幕翻譯、重點標記和筆記功能。

## Features

- 🎯 **智能摘要**：使用 GPT-3.5/Gemini 自動生成影片摘要
- 🔤 **字幕翻譯**：英文字幕即時翻譯為繁體中文
- ✨ **重點標記**：標記重要段落並添加筆記
- 📝 **筆記系統**：完整的筆記管理功能
- 🔍 **內容搜尋**：全文檢索影片內容
- 🎨 **現代化界面**：響應式設計，支援手勢操作
- 💬 **AI Agent**：與影片內容進行深度對話與問答

## 💬 AI Agent：與影片內容深度對話，互動問答，Agent就像ChatGPT一樣會記得討論的內容

AI 聊天機器人，讓你能就影片庫中的特定影片內容，進行前所未有的互動式問答和深度討論。

**How it works？**

當你在觀看一支影片並呼叫聊天機器人時，系統將：

1.  智能識別你當前聚焦的影片。
2.  從資料庫中快速檢索該影片的關鍵資訊，包括：**影片標題、AI 生成的摘要（如果可用）、以及完整的字幕文本**。
3.  將這些豐富的影片上下文，連同你的問題和先前的對話歷史，一起安全地傳遞給後端的大型語言模型。
4.  LLM 基於這些精準的上下文，理解你的意圖並生成針對性的回答。
5.  所有對話都會被妥善記錄，確保你可以就同一影片進行有上下文的、連貫的深入交流。

**跟一般chatbot的差異?**

- 🚀 **超越關鍵字，實現深度理解**：不局限於關鍵字搜尋或固定的摘要，而是能夠結合影片的完整上下文回答更複雜、更細緻、更具洞察力的問題。
- 🗣️ **互動式探索，彷彿與專家對話**：可以就影片中的觀點進行提問、要求解釋、追問細節、甚至讓 AI 總結特定段落的要點。
- 🧠 **記憶能力**：能夠像ChatGPT一樣記得討論的內容，便於回顧和整理，像人類一樣有記憶。
- ⏱️ **化繁為簡，效率倍增**：快速定位影片中的關鍵資訊、獲取多角度的內容總結，顯著節省你手動查閱、反覆觀看和理解影片內容的時間。
- 💡 **啟發思考，拓展視野**：通過與 AI 的互動問答，你可能會發現之前未曾注意到的影片細節或觀點，從而啟發新的思考，拓展知識邊界。

## Authentication

- **多重登入選項**
  - Google OAuth 登入
  - 訪客模式支援 (Guest User)
- **用戶管理**
  - Supabase 用戶資料管理
  - 用戶權限控制
  - Session 持久化

## How to Use

1. **影片資訊擷取**
   - 支援 YouTube URL 解析
   - 自動擷取影片資訊和字幕
2. **字幕處理**
   - 自動分段和格式化
   - 支援字幕編輯和手動上傳
   - 字幕翻譯
   - 支援顏色標記行字幕
3. **摘要生成**
   - 支援多語言摘要
   - 可選擇 GPT-3.5 或 Gemini 模型
4. **筆記系統**
   - CRUD筆記
   - 下載markdown格式筆記
5. **搜尋功能**
   - 全文檢索(影片標題/字幕/摘要/筆記)

## UI Features

- **全尺寸支援**

  - 移動端適配
  - 桌面端優化
  - 4K螢幕支援

- **無障礙支援**
  - ARIA 標籤支援
  - 鍵盤導航
  - 螢幕閱讀器支援

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
- **認證**: NextAuth.js
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
- Google OAuth

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

```bash
# Next.js and NextAuth
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
GOOGLESTUDIO_API_KEY=your_gemini_api_key
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
│   ├── auth/           # 認證相關頁面
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

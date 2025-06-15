## 📘 [English](README.en.md) | 📙 [中文](README.zh.md)

# YouTube Summarizer v2

A compact and elegant personal YouTube video summarization and learning tool, supporting AI-generated summaries, subtitle translation, key point highlighting, and note-taking features.

Solve the problem of managing numerous "Watch Later" videos by simply pasting a YouTube URL to quickly understand the content, decide whether to watch, or categorize and save it for later.

Engage with an AI Agent to discuss video content, extract key information, and organize it effectively.

## Features

- 🎯 **Smart Summarization**: Automatically generate video summaries in English or Chinese using GPT-3.5/Gemini (or choose your preferred model).
- 🔤 **Subtitle Translation**: Instantly translate English subtitles into Traditional Chinese.
- ✨ **Key Point Highlighting**: Mark important segments and add notes.
- 📝 **Note System**: Comprehensive note management functionality.
- 🔍 **Content Search**: Full-text search across video titles, subtitles, summaries, and notes.
- 🎨 **Modern Interface**: Responsive design with gesture support.
- 💬 **AI Agent**: Engage in deep conversations and Q&A about video content.

## 💬 AI Agent: Deep Conversations with Video Content

The AI chatbot allows interactive Q&A and in-depth discussions about specific videos in your library. The conversation history becomes part of the chatbot's context.

### How it works?

1. Identify the video you're currently focused on.
2. Retrieve key information from the database, including the **video title, AI-generated summary (if available), and full subtitle text**.
3. Securely pass this rich video context, along with your question and prior conversation history, to the backend large language model.
4. The LLM understands your intent based on this context and generates targeted responses.
5. All conversations are recorded, ensuring seamless, context-aware discussions about the same video.

### How is it different from a regular chatbot?

- 🚀 **Beyond Keywords, Deep Understanding**  
- 🗣️ **Interactive Exploration, Like Talking to an Expert**  
- 🧠 **Memory Capability**  
- ⏱️ **Streamlined Efficiency**

## Authentication

- **Multiple Login Options**
  - Google OAuth Login
  - Guest Mode Support
- **User Management**
  - Supabase user data management
  - User permission control
  - Session persistence

## How to Use

1. **Video Information Extraction**
2. **Subtitle Processing**
3. **Summary Generation**
4. **Note System**
5. **Search Functionality**

## UI Features

- Full-size & responsive support (mobile, desktop, 4K)
- Accessibility: ARIA, keyboard nav, screen reader support

## Stacks

### Frontend

- **Framework**: Next.js 14  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **State Management**: React Context  
- **UI**: Radix UI, gesture support, custom animations

### Backend

- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js
- **API**: Next.js API Routes
- **AI Services**: OpenAI GPT-3.5, Google Gemini

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API Key
- Google AI Studio API Key
- Google OAuth

### Installation

```bash
git clone https://github.com/joshhong30s/videoSummarizer.git
cd videoSummarizer
npm install
```

### Environment Variables

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

### Database Setup

```bash
cd supabase
psql -h your-db-host -d postgres -U postgres -f init.sql
```

### Start the App

```bash
npm run dev
```

## Project Structure

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

## License

MIT

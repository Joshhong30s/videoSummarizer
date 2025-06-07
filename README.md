# YouTube Summarizer v2

A Next.js application for summarizing YouTube videos, with highlights and saved history.

## Features

- 📚 Video library with summaries
- 🎯 Highlight important parts
- 🌐 Dual language summaries (中文/English)
- 📱 Mobile-first responsive design
- ⚡ Real-time updates with Supabase

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- YouTube Data API key
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL script in `supabase/init.sql` in the SQL editor
3. Get your project URL and anon key from the project settings

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/                  # Next.js app router
│   ├── components/       # React components
│   │   ├── layout/      # Layout components
│   │   ├── pages/       # Page-specific components
│   │   └── video/       # Video-related components
│   └── ...              # Pages and layouts
├── lib/                  # Shared utilities
│   ├── hooks/           # Custom React hooks
│   ├── supabase.ts      # Supabase client
│   └── types.ts         # TypeScript types
├── public/              # Static files
└── supabase/            # Supabase configurations
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks
- **API Integration**: YouTube Data API, OpenAI API

## License

MIT

// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
// 導入新的 functional agent 處理函式
import { processUserMessage } from '@/lib/agent/agent'; // 假設 lib 在根目錄下，並配置了路徑別名 @
// 如果沒有路徑別名，則使用相對路徑: import { processUserMessage } from '../../../lib/agent/agent';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userInput,
      sessionId,
      userId, // (可選) 從客戶端身份驗證中獲取
      sessionMetadata, // (可選) 例如 { videoId: 'current-video-id' }
    } = body;

    if (!userInput) {
      return NextResponse.json({ error: 'userInput is required' }, { status: 400 });
    }

    // 直接呼叫 processUserMessage 函式
    const agentResponse = await processUserMessage(
      userInput,
      sessionId,
      userId,
      sessionMetadata
    );

    return NextResponse.json(agentResponse);
  } catch (error: any) {
    console.error('Error in chat API:', error);
    // 避免洩漏過多錯誤細節給客戶端
    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to process chat message.', details: errorMessage }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage } from '@/lib/agent/agent'; // 假設 lib 在根目錄下，並配置了路徑別名 @

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, sessionId, userId, sessionMetadata } = body;

    if (!userInput) {
      return NextResponse.json(
        { error: 'userInput is required' },
        { status: 400 }
      );
    }

    const agentResponse = await processUserMessage(
      userInput,
      sessionId,
      userId,
      sessionMetadata
    );

    return NextResponse.json(agentResponse);
  } catch (error: any) {
    console.error('Error in chat API:', error);

    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: 'Failed to process chat message.', details: errorMessage },
      { status: 500 }
    );
  }
}

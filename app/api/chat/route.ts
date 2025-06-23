import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage } from '@/lib/agent/agent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, sessionId, sessionMetadata } = body;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

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

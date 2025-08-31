import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../supabase-admin';
import {
  ChatSession,
  createChatSession,
  addMessageToSession,
  getMessagesForSession,
  updateSessionMetadata,
} from './memory';

const GEMINI_API_KEY = process.env.GOOGLESTUDIO_API_KEY;
const GEMINI_MODEL_ID = 'gemini-2.0-flash';

type GeminiContentPart = { text: string };
type GeminiContent = {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
};
type GeminiSystemInstruction = {
  parts: GeminiContentPart[];
};

export interface AgentResponse {
  reply: string;
  sessionId: string;
}

function detectLang(text: string): 'zh' | 'en' | 'other' {
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return 'other';
}

async function getSessionById(
  supabaseClient: SupabaseClient,
  sessionId: string
): Promise<ChatSession | null> {
  const { data, error } = await supabaseClient
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching session by ID [${sessionId}]:`, error);
    throw error;
  }
  return data as ChatSession | null;
}

export async function processUserMessage(
  userInput: string,
  sessionId?: string,
  userId?: string,
  sessionMetadata?: Record<string, any>
): Promise<AgentResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'GOOGLESTUDIO_API_KEY is not set in environment variables.'
    );
  }

  let currentSession: ChatSession;

  if (sessionId) {
    const existingSession = await getSessionById(supabaseAdmin, sessionId);
    if (!existingSession) {
      currentSession = await createChatSession(
        supabaseAdmin,
        userId,
        sessionMetadata
      );
    } else {
      currentSession = existingSession;
      if (sessionMetadata && typeof sessionMetadata === 'object') {
        const currentMetaString = JSON.stringify(currentSession.metadata || {});
        const newMetaString = JSON.stringify(sessionMetadata);
        if (currentMetaString !== newMetaString) {
          const updated = await updateSessionMetadata(
            supabaseAdmin,
            currentSession.id,
            sessionMetadata
          );
          if (updated) currentSession = updated;
        }
      }
    }
  } else {
    currentSession = await createChatSession(
      supabaseAdmin,
      userId,
      sessionMetadata
    );
  }

  const currentSessionId = currentSession.id;

  const historyMessages = await getMessagesForSession(
    supabaseAdmin,
    currentSessionId,
    20
  );

  const geminiChatHistory: GeminiContent[] = historyMessages
    .reverse()
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }],
    }));

  let videoContextText: string | null = null;
  const currentVideoId = currentSession.metadata?.videoId as string | undefined;

  if (currentVideoId) {
    let videoTitle: string | null = null;
    let videoSummaryText: string | null = null;
    let fullSubtitlesText: string | null = null;
    try {
      const { data: videoInfo, error: videoInfoError } = await supabaseAdmin
        .from('videos')
        .select('title')
        .eq('id', currentVideoId)
        .maybeSingle();
      if (videoInfoError) {
        `Error fetching title for video ${currentVideoId}: ${videoInfoError.message}`;
      }
      if (videoInfo) videoTitle = videoInfo.title;
      else
        console.warn(
          `Video with ID ${currentVideoId} not found in 'videos' table.`
        );
      const { data: summaryResults, error: summaryError } = await supabaseAdmin
        .from('summaries')
        .select('en_summary, zh_summary, subtitles')
        .eq('video_id', currentVideoId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (summaryError)
        console.warn(
          `Database error when fetching summary/subtitles for video ${currentVideoId}: ${summaryError.message}`
        );
      else if (summaryResults && summaryResults.length > 0) {
        const summaryData = summaryResults[0];
        videoSummaryText = summaryData.en_summary || summaryData.zh_summary;
        if (videoSummaryText) {
        }
        if (summaryData.subtitles && Array.isArray(summaryData.subtitles)) {
          fullSubtitlesText = summaryData.subtitles
            .map((sub: any) => sub.text)
            .join(' ');
          if (!fullSubtitlesText.trim()) fullSubtitlesText = null;
          else {
          }
        }
      } else {
        `No summary/subtitles found for video ${currentVideoId} in 'summaries' table.`;
      }
      if (videoTitle) {
        let context = `The user is asking about the video titled "${videoTitle}".`;
        if (videoSummaryText)
          context += `\n\nVideo Summary:\n${videoSummaryText}`;
        if (fullSubtitlesText)
          context += `\n\nFull Video Subtitles:\n---\n${fullSubtitlesText}\n---`;
        if (!videoSummaryText && !fullSubtitlesText)
          context += `\nNo detailed summary or subtitles are available for this video.`;
        videoContextText = context;
      } else {
      }
    } catch (e: any) {
      console.error(
        `Unexpected error during video context fetching for ${currentVideoId}: ${e.message}`,
        e
      );
    }
  }

  const userLang = detectLang(userInput);
  let langInstruction = '';
  if (userLang === 'zh') langInstruction = '請以繁體中文回覆用戶問題。';
  else if (userLang === 'en') langInstruction = 'Please answer in English.';

  const systemInstructionParts: GeminiContentPart[] = [];
  if (langInstruction) {
    systemInstructionParts.push({ text: langInstruction });
  }
  systemInstructionParts.push({
    text: `You are a helpful and concise assistant focused on answering questions based on the provided video context (including summary and subtitles).
  
  - Always reference the summary or subtitles when answering video-related questions.
  - Use clear bullet points or numbered lists when the user requests a list or multiple points.
  - If you lack sufficient information, politely inform the user you don't have enough context.
  - Keep answers concise and direct unless a detailed explanation is requested.
  - Do not fabricate information beyond the provided context.
  `,
  });

  if (videoContextText) {
    systemInstructionParts.push({ text: videoContextText });
  }

  const system_instruction: GeminiSystemInstruction = {
    parts: systemInstructionParts,
  };

  const finalContents: GeminiContent[] = [
    ...geminiChatHistory,
    { role: 'user', parts: [{ text: userInput }] },
  ];

  const requestBody = {
    contents: finalContents,
    system_instruction: system_instruction,
    generationConfig: {
      candidateCount: 1,
    },
  };

  let rawAssistantReply =
    "Sorry, I couldn't process that response from the AI.";
  let callSuccess = false;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    let rawResponseText = '';
    if (response.ok) {
      try {
        rawResponseText = await response.text();
        const responseData = JSON.parse(rawResponseText);

        if (responseData.candidates && responseData.candidates.length > 0) {
          const candidate = responseData.candidates[0];
          if (
            candidate.content &&
            candidate.content.parts &&
            candidate.content.parts.length > 0
          ) {
            rawAssistantReply = candidate.content.parts
              .map((part: GeminiContentPart) => part.text)
              .join('');
            callSuccess = true;
          } else if (
            candidate.finishReason &&
            candidate.finishReason !== 'STOP'
          ) {
            rawAssistantReply = `AI model finished with reason: ${candidate.finishReason}. No content generated.`;
          } else {
            console.warn(
              'Gemini candidate had no content parts or empty content.',
              candidate
            );
            rawAssistantReply = 'AI returned an empty response.';
          }
        } else if (responseData.promptFeedback) {
          rawAssistantReply = `Content generation blocked. Reason: ${responseData.promptFeedback.blockReason}.`;
          if (responseData.promptFeedback.blockReasonMessage)
            rawAssistantReply += ` Message: ${responseData.promptFeedback.blockReasonMessage}`;
          console.warn(
            'Gemini content generation blocked:',
            responseData.promptFeedback
          );
        } else {
          rawAssistantReply =
            'Received an unexpected response structure from the AI (200 OK).';
        }
      } catch (error: any) {
        rawAssistantReply = `Error processing AI response: ${error.message}. Raw response snippet: ${rawResponseText.substring(0, 200)}`;
      }
    } else {
      let errorResponseMessage = `Gemini API request failed with status ${response.status}`;
      try {
        rawResponseText = await response.text();
        console.error('Raw Gemini API Error Response Text:', rawResponseText);
        try {
          const errorData = JSON.parse(rawResponseText);
          if (errorData.error && errorData.error.message) {
            errorResponseMessage = errorData.error.message;
          } else if (rawResponseText) {
            errorResponseMessage = rawResponseText;
          }
        } catch (parseError) {
          if (rawResponseText) errorResponseMessage = rawResponseText;
        }
      } catch (textError) {}
      throw new Error(errorResponseMessage);
    }
  } catch (error: any) {
    console.error(
      'Error calling Gemini API or processing its response:',
      error
    );
    rawAssistantReply = `Error communicating with AI: ${error.message}`;
  }

  await addMessageToSession(supabaseAdmin, currentSessionId, {
    role: 'user',
    content: userInput,
  });
  await addMessageToSession(supabaseAdmin, currentSessionId, {
    role: 'assistant',
    content: rawAssistantReply,
  });

  let finalAssistantReply = rawAssistantReply;

  return {
    reply: finalAssistantReply,
    sessionId: currentSessionId,
  };
}

// lib/agent/agent.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import {
  ChatSession,
  createChatSession,
  addMessageToSession,
  getMessagesForSession,
  updateSessionMetadata,
} from './memory';

// --- Google Gemini API Configuration ---
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
    console.error('GOOGLESTUDIO_API_KEY is not set in environment variables.');
    throw new Error(
      'GOOGLESTUDIO_API_KEY is not set in environment variables.'
    );
  }

  let currentSession: ChatSession;

  if (sessionId) {
    const existingSession = await getSessionById(supabase, sessionId);
    if (!existingSession) {
      console.warn(`Session ID ${sessionId} not found. Creating new session.`);
      currentSession = await createChatSession(
        supabase,
        userId,
        sessionMetadata
      );
    } else {
      currentSession = existingSession;
      if (sessionMetadata && typeof sessionMetadata === 'object') {
        const currentMetaString = JSON.stringify(currentSession.metadata || {});
        const newMetaString = JSON.stringify(sessionMetadata);
        if (currentMetaString !== newMetaString) {
          console.log(
            `Updating session ${currentSession.id} metadata from ${currentMetaString} to ${newMetaString}`
          );
          const updated = await updateSessionMetadata(
            supabase,
            currentSession.id,
            sessionMetadata
          );
          if (updated) currentSession = updated;
        }
      }
    }
  } else {
    currentSession = await createChatSession(supabase, userId, sessionMetadata);
  }

  const currentSessionId = currentSession.id;

  const historyMessages = await getMessagesForSession(
    supabase,
    currentSessionId,
    20 // Fetch last 10 messages (user + assistant pairs)
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
    console.log(
      `Found videoId in current session: ${currentVideoId}. Fetching video details...`
    );
    let videoTitle: string | null = null;
    let videoSummaryText: string | null = null;
    let fullSubtitlesText: string | null = null;
    try {
      const { data: videoInfo, error: videoInfoError } = await supabase
        .from('videos')
        .select('title')
        .eq('id', currentVideoId)
        .maybeSingle();
      if (videoInfoError)
        console.error(
          `Error fetching title for video ${currentVideoId}: ${videoInfoError.message}`
        );
      if (videoInfo) videoTitle = videoInfo.title;
      else
        console.warn(
          `Video with ID ${currentVideoId} not found in 'videos' table.`
        );
      const { data: summaryResults, error: summaryError } = await supabase
        .from('summaries')
        .select('en_summary, zh_summary, subtitles')
        .eq('video_id', currentVideoId);
      if (summaryError)
        console.warn(
          `Database error when fetching summary/subtitles for video ${currentVideoId}: ${summaryError.message}`
        );
      else if (summaryResults && summaryResults.length > 0) {
        const summaryData = summaryResults[0];
        videoSummaryText = summaryData.en_summary || summaryData.zh_summary;
        if (videoSummaryText)
          console.log(
            `Found summary for ${currentVideoId}. Used: ${summaryData.en_summary ? 'English' : 'Chinese'}.`
          );
        if (summaryData.subtitles && Array.isArray(summaryData.subtitles)) {
          fullSubtitlesText = summaryData.subtitles
            .map((sub: any) => sub.text)
            .join(' ');
          if (!fullSubtitlesText.trim()) fullSubtitlesText = null;
          else
            console.log(
              `Extracted full subtitles text for ${currentVideoId} (length: ${fullSubtitlesText.length})`
            );
        }
      } else
        console.log(
          `No summary/subtitles found for video ${currentVideoId} in 'summaries' table.`
        );
      if (videoTitle) {
        let context = `The user is asking about the video titled "${videoTitle}".`;
        if (videoSummaryText)
          context += `\n\nVideo Summary:\n${videoSummaryText}`;
        if (fullSubtitlesText)
          context += `\n\nFull Video Subtitles:\n---\n${fullSubtitlesText}\n---`;
        if (!videoSummaryText && !fullSubtitlesText)
          context += `\nNo detailed summary or subtitles are available for this video.`;
        videoContextText = context;
      } else
        console.warn(
          `Could not form video context for ${currentVideoId} as title was not found.`
        );
    } catch (e: any) {
      console.error(
        `Unexpected error during video context fetching for ${currentVideoId}: ${e.message}`,
        e
      );
    }
  }

  const systemInstructionParts: GeminiContentPart[] = [
    {
      text: 'You are a helpful assistant. Please answer questions based on the provided video context if available. If the user asks for a list or multiple points, please use a bulleted or numbered list for clarity.',
    },
  ];
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

  console.log(
    'Request body for Gemini API:',
    JSON.stringify(requestBody, null, 2)
  );

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
        console.log(
          'Raw Gemini API Success Response Text (Status 200):',
          rawResponseText
        );
        const responseData = JSON.parse(rawResponseText);
        console.log(
          'Gemini API Success Response (Parsed JSON):',
          JSON.stringify(responseData, null, 2)
        );

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
            console.warn(
              `Gemini candidate finished with reason: ${candidate.finishReason}`,
              candidate
            );
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
          console.warn(
            'Gemini API response did not contain candidates or promptFeedback.',
            responseData
          );
          rawAssistantReply =
            'Received an unexpected response structure from the AI (200 OK).';
        }
      } catch (error: any) {
        console.error(
          'Error processing Gemini API success response (status 200):',
          error
        );
        console.error(
          'Raw response text that caused error (if available):',
          rawResponseText
        );
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
          console.warn(
            'Failed to parse Gemini error response as JSON, using raw text if available.',
            parseError
          );
        }
      } catch (textError) {
        console.error(
          'Failed to read error response text from Gemini API:',
          textError
        );
      }
      console.error(
        'Gemini API Error Status:',
        response.status,
        'Final Error Message:',
        errorResponseMessage
      );
      throw new Error(errorResponseMessage);
    }
  } catch (error: any) {
    console.error(
      'Error calling Gemini API or processing its response:',
      error
    );
    rawAssistantReply = `Error communicating with AI: ${error.message}`;
  }

  await addMessageToSession(supabase, currentSessionId, {
    role: 'user',
    content: userInput,
  });
  await addMessageToSession(supabase, currentSessionId, {
    role: 'assistant',
    content: rawAssistantReply,
  });

  let finalAssistantReply = rawAssistantReply;

  return {
    reply: finalAssistantReply,
    sessionId: currentSessionId,
  };
}

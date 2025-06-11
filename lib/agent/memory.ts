// lib/agent/memory.ts

import { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '../supabase';

export interface ChatSession {
  id: string;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any> | null;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string | null;
  tool_calls?: any[] | null;
  tool_call_id?: string | null;
  name?: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
}

/**

 * @param supabase 
 * @param userId 
 * @param initialMetadata 
 * @returns
 */
export async function createChatSession(
  supabase: SupabaseClient,
  userId?: string,
  initialMetadata?: Record<string, any>
): Promise<ChatSession> {
  const sessionData: Partial<ChatSession> = {
    user_id: userId,
    metadata: initialMetadata,
  };

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }

  return data as ChatSession;
}

/**

 * @param supabase 
 * @param sessionId 
 * @param messageData 
 * @returns 
 */
export async function addMessageToSession(
  supabase: SupabaseClient,
  sessionId: string,
  messageData: Omit<ChatMessage, 'id' | 'session_id' | 'created_at'>
): Promise<ChatMessage> {
  const messageToInsert = {
    session_id: sessionId,
    ...messageData,
  };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert(messageToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding message to session:', error);
    throw error;
  }

  const { error: updateSessionError } = await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (updateSessionError) {
    console.error('Error updating session timestamp:', updateSessionError);
  }

  return data as ChatMessage;
}

/**

 * @param supabase 
 * @param sessionId 
 * @param limit 
 * @param offset 
 * @returns 
 */
export async function getMessagesForSession(
  supabase: SupabaseClient,
  sessionId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error getting messages for session:', error);
    throw error;
  }

  return data as ChatMessage[];
}

/**

 * @param supabase 
 * @param userId 
 * @param limit 
 * @param offset 
 * @returns 
 */
export async function getSessionsForUser(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ChatSession[]> {
  if (!userId) {
    console.warn(
      'getSessionsForUser called without a userId. Returning empty array.'
    );
    return [];
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error getting sessions for user:', error);
    throw error;
  }

  return data as ChatSession[];
}

/**
 * @param supabase
 * @param sessionId
 * @param metadata
 * @returns
 */
export async function updateSessionMetadata(
  supabase: SupabaseClient,
  sessionId: string,
  metadata: Record<string, any>
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ metadata, updated_at: new Date().toISOString() }) // Also update updated_at
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session metadata:', error);

    throw error;
  }

  return data as ChatSession | null;
}

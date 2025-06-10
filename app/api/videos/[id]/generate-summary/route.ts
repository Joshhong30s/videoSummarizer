import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';
import type { SubtitleEntry } from '@/lib/types';
import type { Database } from '@/lib/types/database';

type Summary = Database['public']['Tables']['summaries']['Row'];
type SummaryModel = 'openai' | 'gemini';

interface GenerateSummaryPayload {
  subtitles: SubtitleEntry[];
  model: SummaryModel;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || GUEST_USER_ID;

    // 驗證視頻所有權
    const { data: video, error: videoCheckError } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (videoCheckError) {
      console.error('Error checking video ownership:', videoCheckError);
      throw videoCheckError;
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to generate summary for this video' },
        { status: 403 }
      );
    }

    const { subtitles, model } =
      (await request.json()) as GenerateSummaryPayload;

    if (!subtitles || !Array.isArray(subtitles)) {
      return NextResponse.json(
        { message: 'Subtitles are required and must be an array' },
        { status: 400 }
      );
    }

    if (!model || !['openai', 'gemini'].includes(model)) {
      return NextResponse.json(
        { message: 'Invalid model specified' },
        { status: 400 }
      );
    }

    const fullText = subtitles.map(line => line.text).join(' ');

    const generateSummary = async (
      text: string,
      language: 'en' | 'zh'
    ): Promise<string> => {
      if (model === 'openai') {
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a content master that summarizes video content.',
                },
                {
                  role: 'user',
                  content:
                    language === 'en'
                      ? `Please provide a concise summary of the following video content in English. Use Markdown format clearly structured:\n\n${text}\n\nSummary:`
                      : `請以繁體中文摘要以下影片內容，著重整理主要重點與關鍵資訊，嚴格使用繁體中文詞彙，使用 Markdown 結構輸出重點整理:\n\n${text}\n\nSummary:`,
                },
              ],
              max_tokens: 1500,
              temperature: 0.5,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('OpenAI API error details:', errorData);
          throw new Error(
            `OpenAI API error: ${response.statusText} - ${errorData}`
          );
        }

        const data = await response.json();
        return data.choices[0].message.content || '';
      } else {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GOOGLESTUDIO_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text:
                        language === 'en'
                          ? `Please provide a concise summary of the following video content in English. Use Markdown format clearly structured:\n\n${text}`
                          : `請以繁體中文（請勿使用簡體中文）摘要以下影片內容，嚴格使用繁體中文詞彙，使用 Markdown 結構輸出重點整理:\n\n${text}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                thinkingConfig: { thinkingBudget: 256 },
                maxOutputTokens: 2000,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Gemini API error details:', errorData);
          throw new Error(
            `Gemini API error: ${response.statusText} - ${errorData}`
          );
        }

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        } else if (data.candidates?.[0]?.content?.text) {
          return data.candidates[0].content.text;
        } else {
          console.error('Unexpected Gemini API response structure:', data);
          throw new Error('Invalid response structure from Gemini API');
        }
      }
    };

    console.log(`Generating full text summary...`);
    const enSummary = await generateSummary(fullText, 'en');
    const zhSummary = await generateSummary(fullText, 'zh');

    const summaryData: Partial<Summary> = {
      video_id: params.id,
      en_summary: enSummary.trim(),
      zh_summary: zhSummary.trim(),
      subtitles: subtitles,
      classification: null,
      created_at: new Date().toISOString(),
      user_id: userId, // 添加 user_id
    };

    const { error: insertError } = await supabaseAdmin
      .from('summaries')
      .upsert(summaryData);

    if (insertError) {
      console.error('Failed to save summary:', insertError);
      throw new Error(`Failed to save summary: ${insertError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ status: 'summarized' })
      .eq('id', params.id)
      .eq('user_id', userId); // 確保只更新用戶自己的視頻

    if (updateError) {
      throw new Error(`Failed to update video status: ${updateError.message}`);
    }

    return NextResponse.json(
      { success: true, message: 'Summary generated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { GUEST_USER_ID } from '@/lib/supabase';
import { SubtitleEntry } from '@/lib/types';

interface Translation {
  start_time: number;
  translated_text: string;
}

function combineSubtitles(subtitles: SubtitleEntry[]) {
  const numberedSubtitles = subtitles
    .map((s, i) => `${i + 1}. ${s.text}`)
    .join('\n\n');

  return `Please translate the following English subtitles to Traditional Chinese. Keep the line numbers:

${numberedSubtitles}

Translations (keep the same format with numbers):`;
}

function parseTranslations(
  text: string,
  subtitles: SubtitleEntry[]
): Translation[] {
  const translations: Translation[] = [];

  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*(.+)$/);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const translatedText = match[2].trim();

      if (index >= 0 && index < subtitles.length) {
        translations.push({
          start_time: subtitles[index].start,
          translated_text: translatedText,
        });
      }
    }
  }

  return translations;
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
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 404 }
      );
    }

    if (!video || video.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to translate this video' },
        { status: 403 }
      );
    }

    const { subtitles } = await request.json();

    if (!Array.isArray(subtitles)) {
      return NextResponse.json(
        { message: 'Invalid subtitles format' },
        { status: 400 }
      );
    }

    const { data: existingTranslations, error: fetchError } =
      await supabaseAdmin
        .from('subtitle_translations')
        .select('start_time, translated_text')
        .eq('video_id', params.id);

    if (fetchError) {
      console.error('Error fetching existing translations:', fetchError);
      throw new Error('Failed to fetch existing translations');
    }

    const translationsMap = new Map(
      existingTranslations?.map(
        (t: { start_time: number; translated_text: string }) => [
          t.start_time,
          t.translated_text,
        ]
      ) || []
    );

    const untranslatedSubtitles = subtitles.filter(
      s => !translationsMap.has(Math.floor(s.start))
    );

    if (untranslatedSubtitles.length > 0) {
      const translationPrompt = combineSubtitles(untranslatedSubtitles);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLESTUDIO_API_KEY}`,
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
                    text: translationPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.candidates[0].content.parts[0].text;

      const newTranslations = parseTranslations(
        translatedText,
        untranslatedSubtitles
      );

      const translationsToInsert = newTranslations
        .map(translation => {
          const subtitle = untranslatedSubtitles.find(
            s => Math.floor(s.start) === Math.floor(translation.start_time)
          );
          if (!subtitle) return null;

          return {
            video_id: params.id,
            user_id: userId, // 添加用戶 ID
            start_time: Math.floor(translation.start_time),
            end_time: Math.floor(translation.start_time + subtitle.duration),
            original_text: subtitle.text,
            translated_text: translation.translated_text,
          };
        })
        .filter(Boolean);

      const { error: insertError } = await supabaseAdmin
        .from('subtitle_translations')
        .insert(translationsToInsert)
        .select();

      if (insertError) {
        console.error('Error details:', insertError, {
          translationsToInsert,
          params,
        });
        throw new Error(`Failed to save translations: ${insertError.message}`);
      }

      console.log(
        'Successfully inserted translations:',
        translationsToInsert.length
      );

      for (const translation of newTranslations) {
        translationsMap.set(
          Math.floor(translation.start_time),
          translation.translated_text
        );
      }
    }

    const translations = subtitles.map(s => ({
      start: s.start,
      translation: translationsMap.get(Math.floor(s.start)) || null,
    }));

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        message: 'Failed to translate subtitles',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

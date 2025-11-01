
import { GoogleGenAI, Modality } from '@google/genai';
import type { RewriteStyle } from '../types';
import { REWRITE_STYLES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const stylePrompts: Record<RewriteStyle, string> = {
  natural: 'بأسلوب طبيعي وبسيط',
  documentary: 'بأسلوب راوي أفلام وثائقية فخم',
  news: 'بأسلوب مذيع أخبار محترف ورسمي',
  scientific: 'بأسلوب مقدم برامج علمية مبسط ومفهوم',
  suspense: 'بأسلوب غامض ومثير للتشويق',
  historical: 'بأسلوب راوي قصص تاريخية ملهم',
  investigative: 'بأسلوب استقصائي يكشف الحقائق',
};

export const rewriteText = async (text: string, styleId: RewriteStyle): Promise<string> => {
  const styleDescription = stylePrompts[styleId] || stylePrompts.natural;
  const prompt = `أعد صياغة النص التالي ${styleDescription}. يجب أن يكون الناتج هو النص المعاد صياغته فقط، بدون أي مقدمات أو ملاحظات إضافية.\n\nالنص الأصلي:\n"${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error rewriting text:', error);
    throw new Error('فشلت عملية إعادة صياغة النص.');
  }
};

export const generateSpeech = async (
  text: string,
  styleId: RewriteStyle,
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'
): Promise<string> => {
  const styleName = REWRITE_STYLES.find(s => s.id === styleId)?.name || 'طبيعي';
  const prompt = `قل بأسلوب ${styleName}: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('لم يتم العثور على بيانات صوتية في الاستجابة.');
    }
    return base64Audio;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('فشلت عملية توليد الصوت.');
  }
};

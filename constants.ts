
import type { RewriteStyle, VoiceOption } from './types';

export const REWRITE_STYLES: { id: RewriteStyle; name: string }[] = [
  { id: 'natural', name: 'طبيعي' },
  { id: 'documentary', name: 'راوي وثائقي' },
  { id: 'news', name: 'مذيع أخبار' },
  { id: 'scientific', name: 'مقدم علمي' },
  { id: 'suspense', name: 'غامض/تشويقي' },
  { id: 'historical', name: 'راوي تاريخي' },
  { id: 'investigative', name: 'كشف حقائق/استقصائي' },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'karim', name: 'كريم', apiName: 'Kore' },
  { id: 'bakr', name: 'بكر', apiName: 'Puck' },
  { id: 'shadi', name: 'شادي', apiName: 'Charon' },
  { id: 'faris', name: 'فارس', apiName: 'Fenrir' },
  { id: 'zuhair', name: 'زهير', apiName: 'Zephyr' },
];

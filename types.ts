
export type RewriteStyle = 
  | 'natural'
  | 'documentary'
  | 'news'
  | 'scientific'
  | 'suspense'
  | 'historical'
  | 'investigative';

export type VoiceOption = {
  id: string;
  name: string;
  apiName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
};

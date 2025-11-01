import React, { useState } from 'react';
import { rewriteText } from '../services/geminiService';
import { REWRITE_STYLES } from '../constants';
import type { RewriteStyle } from '../types';
import { Loader } from './ui/Loader';
import { RefreshIcon } from './icons/RefreshIcon';

interface WriterSectionProps {
  text: string;
  onTextChange: (newText: string) => void;
}

export const WriterSection: React.FC<WriterSectionProps> = ({ text, onTextChange }) => {
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RewriteStyle>('natural');

  const handleRewrite = async () => {
    if (isRewriting || !text.trim()) return;
    setIsRewriting(true);
    setError(null);
    try {
      const newText = await rewriteText(text, selectedStyle);
      setRewrittenText(newText);
    } catch (err) {
      setError((err as Error).message);
      setRewrittenText(null); // Clear result on error
    } finally {
      setIsRewriting(false);
    }
  };

  const handleApply = () => {
    if (rewrittenText) {
      onTextChange(rewrittenText);
      setRewrittenText(null);
    }
  };
  
  const selectedStyleName = REWRITE_STYLES.find(s => s.id === selectedStyle)?.name || 'طبيعي';

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-700 backdrop-blur-sm flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-teal-400">الكاتب</h2>
      <div className="relative flex-grow">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="اكتب شيئاً..."
          className="w-full h-64 bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all resize-y"
        />
      </div>

      {/* New Rewrite Controls Section */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-300">إعادة صياغة النص</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-grow flex items-center gap-3">
            <label htmlFor="style-select" className="font-medium text-gray-400 whitespace-nowrap">الأسلوب:</label>
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as RewriteStyle)}
              className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
            >
              {REWRITE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRewrite}
            disabled={isRewriting || !text.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
          >
            {isRewriting ? <Loader /> : 'صياغة'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
      
      {rewrittenText && (
        <div className="mt-6 p-4 border border-teal-500/30 bg-gray-900/50 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-gray-300">النص المقترح (<span className="text-teal-400">{selectedStyleName}</span>):</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{rewrittenText}</p>
          <div className="mt-4 flex gap-4">
            <button onClick={handleApply} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              اعتماد النص الجديد
            </button>
            <button 
              onClick={handleRewrite} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
              disabled={isRewriting}
            >
              {isRewriting ? <Loader/> : <RefreshIcon className="w-5 h-5"/>}
              إعادة إنشاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';
import { REWRITE_STYLES, VOICE_OPTIONS } from '../constants';
import type { RewriteStyle, VoiceOption } from '../types';
import { decodeBase64, decodePcmData, createWavBlob } from '../utils/audioUtils';
import { Loader } from './ui/Loader';
import { IconButton } from './ui/IconButton';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface SpeakerSectionProps {
  text: string;
}

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const SpeakerSection: React.FC<SpeakerSectionProps> = ({ text }) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = useState<RewriteStyle>('natural');
  const [speed, setSpeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
      setIsPlaying(false);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);
  
  const handleGenerateSpeech = async () => {
    stopPlayback();
    setIsGenerating(true);
    setError(null);
    setAudioBuffer(null);
    try {
      const base64Audio = await generateSpeech(text, selectedStyle, selectedVoice.apiName);
      const pcmData = decodeBase64(base64Audio);
      const buffer = await decodePcmData(pcmData, audioContext);
      setAudioBuffer(buffer);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else if (audioBuffer) {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speed;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      source.start(0);
      sourceRef.current = source;
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (audioBuffer) {
      const blob = createWavBlob(audioBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">المتحدث</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="voice-select" className="block mb-2 font-medium text-gray-300">صوت المتحدث</label>
          <select 
            id="voice-select" 
            value={selectedVoice.id}
            onChange={(e) => setSelectedVoice(VOICE_OPTIONS.find(v => v.id === e.target.value) || VOICE_OPTIONS[0])}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {VOICE_OPTIONS.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="style-select" className="block mb-2 font-medium text-gray-300">النبرة والأسلوب</label>
          <select 
            id="style-select"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as RewriteStyle)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {REWRITE_STYLES.map(style => <option key={style.id} value={style.id}>{style.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="speed-slider" className="block mb-2 font-medium text-gray-300">سرعة النطق: {speed.toFixed(1)}x</label>
          <input
            id="speed-slider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleGenerateSpeech}
          disabled={isGenerating || !text}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-lg"
        >
          {isGenerating ? <Loader /> : 'توليد الصوت'}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {audioBuffer && (
        <div className="mt-6 p-4 border border-blue-500/30 bg-gray-900/50 rounded-lg flex items-center justify-between">
          <p className="font-semibold text-gray-300">الصوت جاهز للاستماع</p>
          <div className="flex items-center gap-4">
            <IconButton onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

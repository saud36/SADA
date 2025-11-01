
// Helper to decode base64 string
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM data into an AudioBuffer
export async function decodePcmData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // Gemini TTS sample rate
  const numChannels = 1; // Gemini TTS is mono
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}


// Creates a WAV file Blob from an AudioBuffer
export function createWavBlob(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i = 0;
  let sample = 0;
  let offset = 0;

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  // RIFF header
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, length - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  
  // FMT sub-chunk
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; // Sub-chunk size
  view.setUint16(offset, 1, true); offset += 2; // Audio format (PCM)
  view.setUint16(offset, numOfChan, true); offset += 2;
  view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4;
  view.setUint32(offset, audioBuffer.sampleRate * 2 * numOfChan, true); offset += 4; // Byte rate
  view.setUint16(offset, numOfChan * 2, true); offset += 2; // Block align
  view.setUint16(offset, 16, true); offset += 2; // Bits per sample

  // Data sub-chunk
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, audioBuffer.length * numOfChan * 2, true); offset += 4;

  for (i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  // Interleave channels
  const pcmData = new Float32Array(audioBuffer.length * numOfChan);
  for (i = 0; i < audioBuffer.length; i++) {
    for (let j = 0; j < numOfChan; j++) {
        pcmData[i * numOfChan + j] = channels[j][i];
    }
  }

  floatTo16BitPCM(view, offset, pcmData);

  return new Blob([view], { type: 'audio/wav' });
}

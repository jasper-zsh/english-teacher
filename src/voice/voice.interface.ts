import * as pumpify from 'pumpify';

export abstract class TextToSpeechInterface {
  abstract textToSpeech(text: string): Promise<Buffer>;
}

export abstract class SpeechToTextInterface {
  abstract speechToText(audio: Buffer): Promise<string>;
}

export interface StreamingSpeechToTextInterface {
  type: 'streaming';
  streamingSpeechToText(): pumpify;
}

export function streamingSpeechToText(
  obj: any,
): StreamingSpeechToTextInterface {
  return obj.type === 'streaming' ? obj : undefined;
}

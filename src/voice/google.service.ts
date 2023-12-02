import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Injectable } from '@nestjs/common';
import * as pumpify from 'pumpify';

@Injectable()
export class GoogleVoiceService {
  private ttsClient: TextToSpeechClient;
  private speechClient: SpeechClient;

  constructor() {
    this.ttsClient = new TextToSpeechClient();
    this.speechClient = new SpeechClient();
  }

  async textToSpeech(text: string): Promise<Buffer> {
    const [res] = await this.ttsClient.synthesizeSpeech({
      input: {
        text,
      },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });
    return res.audioContent as Buffer;
  }

  async speechToText(audio: Buffer): Promise<string> {
    const [res] = await this.speechClient.recognize({
      audio: {
        content: audio,
      },
      config: {
        encoding: 'WEBM_OPUS',
        languageCode: 'en-US',
      },
    });
    return res.results.map((r) => r.alternatives[0].transcript).join(' ');
  }

  streamingSpeechToText(): pumpify {
    return this.speechClient.streamingRecognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
    });
  }
}

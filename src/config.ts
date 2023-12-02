import { get } from 'env-var';

export default class Config {
  static get OPENAI_API_KEY() {
    return get('OPENAI_API_KEY').required().asString();
  }

  static get LLAMA_API_TOKEN() {
    return get('LLAMA_API_TOKEN').required().asString();
  }

  static get FE_BASE_URL() {
    return get('FE_BASE_URL').required().asString();
  }
}

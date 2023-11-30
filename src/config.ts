import { get } from 'env-var';

export default class Config {
  public static readonly OPENAI_API_KEY = get('OPENAI_API_KEY')
    .required()
    .asString();
}

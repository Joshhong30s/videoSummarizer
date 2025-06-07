declare module 'openai' {
  export interface ConfigurationParameters {
    apiKey: string;
    organization?: string;
  }

  export class Configuration {
    constructor(params: ConfigurationParameters);
  }

  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    choices: {
      index: number;
      message?: ChatMessage;
      finish_reason: string;
    }[];
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  export class OpenAIApi {
    constructor(configuration: Configuration);

    createChatCompletion(params: {
      model: string;
      messages: ChatMessage[];
      temperature?: number;
      max_tokens?: number;
    }): Promise<{ data: ChatCompletionResponse }>;
  }
}

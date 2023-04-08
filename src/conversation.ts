import { Configuration, OpenAIApi } from "openai";

export class OpenAIIntegration {

  private configuration: Configuration;

  private openai: OpenAIApi;

  constructor(openAiKey: string) {
    this.configuration = new Configuration({
      apiKey: openAiKey
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async chat(input: string, instruction: string): Promise<string> {
    return this.openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        max_tokens: 400,
        messages: [
          {
            "role": "system",
            "content": instruction,
          },
          {
          "role": "user",
          "content": `${input}`,
        }]
      }
    ).then((response) => {
      return response.data.choices[0]?.message?.content || "";
    });
  }
}
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { ConversationHistory } from "./conversation-history";

export class OpenAIIntegration {

  private configuration: Configuration;
  private openai: OpenAIApi;

  constructor(openAiKey: string, public conversationHistory: ConversationHistory) {

    this.configuration = new Configuration({
      apiKey: openAiKey
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async chat(userMessage: string, instruction: string, discordUser?: string): Promise<string> {
    const msg = this.conversationHistory.addMessage(
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        name: discordUser,
        content: userMessage
      }
    );

    const messages = [
      {
        "role": "system",
        "content": instruction,
      } as ChatCompletionRequestMessage,
      ...this.conversationHistory.getUserAndAssistantHistoryForSend()
    ];

    console.log(JSON.stringify(messages, null, 2))

    return this.openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        max_tokens: 1200,
        messages: messages,
      }
    ).then((response) => {
      const responseContent = response.data.choices[0]?.message?.content || "";
      msg.setResponse({ role: "assistant", content: responseContent });
      return responseContent;
    });
  }
}
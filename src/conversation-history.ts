import { ChatCompletionRequestMessage } from 'openai';

import { MessageRequestResponse } from './MessageRequestResponse';

export const ASSUMED_TOKEN_COUNT_PER_CHARACTER = 4;

export class ConversationHistory {
  messages: MessageRequestResponse[] = [];


  /**
   *
   */
  constructor(readonly maxTokens: number) {
  }

  /**
   *
   * @param message User's message
   * @param currentTokenCount The total number of tokens in the conversation so far
   *                       (excluding the message being added) as returned
   *                         from the openai chat API response.
   *  'usage': {'prompt_tokens': 56, 'completion_tokens': 31, 'total_tokens': 87},
   */
  public addMessage(message: ChatCompletionRequestMessage) {
    const newTokens = message.content.length / ASSUMED_TOKEN_COUNT_PER_CHARACTER;

    this.removeMessagesUntilUnderMaxTokens(newTokens);

    const mrqr = new MessageRequestResponse(message);

    this.messages.push(
      mrqr
    );

    return mrqr;
  }


  private removeMessagesUntilUnderMaxTokens(incomingTokenCount: number) {
    const existingMessageTokens = this.messages.reduce((acc, msg) => acc + msg.getApprxNumOfTokens(), 0);
    const totalTokenCount = existingMessageTokens + incomingTokenCount;
    if (totalTokenCount > this.maxTokens) {
      this.messages = this.messages.slice(1)
      this.removeMessagesUntilUnderMaxTokens(incomingTokenCount);
    }
  }


  /** Filters out system messages */
  public getUserAndAssistantHistoryForSend(): ChatCompletionRequestMessage[] {
    return this.messages.flatMap((msgPair) => msgPair.serialize()).filter(r => r && r.role !== "system");
  }
}
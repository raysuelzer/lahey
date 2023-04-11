import { ChatCompletionRequestMessage, ChatCompletionResponseMessage } from 'openai';
import { ASSUMED_TOKEN_COUNT_PER_CHARACTER } from './conversation-history';

export class MessageRequestResponse {
  public request: ChatCompletionRequestMessage;
  public response: ChatCompletionRequestMessage;

  /**
   *
   */
  constructor(request: ChatCompletionRequestMessage) {
    this.request = request;
  }

  public setResponse(response: ChatCompletionResponseMessage) {
    this.response = response;
  }

  public serialize(): [ChatCompletionRequestMessage, ChatCompletionRequestMessage] {
    return [this.request, this.response];
  }

  public getApprxNumOfTokens(): number {
    return (this.request.content.length + (this.response?.content?.length || 0) / ASSUMED_TOKEN_COUNT_PER_CHARACTER);
  }
}

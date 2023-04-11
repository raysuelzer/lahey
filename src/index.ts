import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';

import { OpenAIIntegration } from './conversation';
import { LAHEY_INSTRUCTION } from './prompt';
import { KeepAliveServer } from './server';
import { ConversationHistory } from './conversation-history';

dotenv.config();


const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds]
});
const openAIAPIKey = process.env.OPENAI_API_KEY!;

const convoHistory = new ConversationHistory(1050);

const openAIClient = new OpenAIIntegration(openAIAPIKey, convoHistory);

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    // You can customize the trigger phrase or command for your bot
    if (client?.user && message.mentions.has(client.user)) {
      // Get the ID of the bot user and replace it with lehay
      const cleanedMessage = message.content.replace(`<@${client.user.id}>`, 'lehay')
      processMessage(cleanedMessage, message, LAHEY_INSTRUCTION)
    }
    else if (message.content?.toLowerCase().startsWith('!lahey')) {
      const prompt = `${message.content.slice(7)}` || 'I am the liquor';
      processMessage(prompt, message, LAHEY_INSTRUCTION)
    }

  } catch (error) {
    console.error('Error generating text from GPT:', error);
  }
});

async function processMessage(cleanedMessage: string,
  message: Message, aiSystemMessage: string

  ) {
  const typing = new TypingController(message.channel as TextChannel); // Start the typing indicator loop

  try {
    typing.startTyping();
    const response = await openAIClient.chat(cleanedMessage, aiSystemMessage, message.author.id);
    message.reply(response).then(() => {
      typing.stopTyping();
    });
  } catch (error) {
    console.error('Error generating text from GPT:', error);
    message.reply('Looks like the shithawks got in the way, pal. Gimme a sec to sober up and try again.');
  } finally {
    // Cancel the typing indicator loop
    typing.stopTyping();
  }
}


export class TypingController {
  constructor(private channel: TextChannel) {
  }
  private cancelToken: NodeJS.Timer | undefined;

  public async startTyping(): Promise<void> {
    // What the shit, this doesn't resolve after ten seconds
    // shit documentation discord.
    await this.channel.sendTyping()
    this.cancelToken = setInterval(() => this.channel.sendTyping(), 5500)
  }

  public stopTyping(): void {
    clearInterval(this.cancelToken);
  }
}

new KeepAliveServer().keepAlive();
client.login(process.env.DISCORD_BOT_TOKEN);
import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';

import { OpenAIIntegration } from './conversation';
import { LAHEY_INSTRUCTION } from './prompt';
import { KeepAliveServer } from './server';

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

const openAIClient = new OpenAIIntegration(openAIAPIKey);

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    // You can customize the trigger phrase or command for your bot
    if (message.content?.toLowerCase().startsWith('!lahey')) {
      processCommand(message, LAHEY_INSTRUCTION)
    }

  } catch (error) {
    console.error('Error generating text from GPT:', error);
  }
});

async function processCommand(message: Message, systemMessage: string) {
  const typing =  new TypingController(message.channel as TextChannel); // Start the typing indicator loop

  try {
    typing.startTyping();
    const prompt = `${message.content.slice(7)}`;
    const response = await openAIClient.chat(prompt, systemMessage);
    message.reply(response).then(() => {;
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
  private isTypingCompleted = false;

  public async startTyping(): Promise<void> {
    // What the shit, this doesn't resolve after ten seconds
    // shit documentation discord.
    await this.channel.sendTyping().finally(() => {
      if (this.isTypingCompleted) return;
      this.startTyping();
    })
  }

  public stopTyping(): void {
    this.isTypingCompleted = true;
    console.log('Typing completed');
  }
}

new KeepAliveServer().keepAlive();
client.login(process.env.DISCORD_BOT_TOKEN);
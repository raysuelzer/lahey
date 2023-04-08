import axios from 'axios';
import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { OpenAIIntegration } from './conversation';
import { INSTRUCTION } from './prompt';

dotenv.config();

interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
  let hasCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) =>
    promise.then(
      (value) => (hasCanceled ? reject({ isCanceled: true }) : resolve(value)),
      (error) => (hasCanceled ? reject({ isCanceled: true }) : reject(error))
    )
  );

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}

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

const laheyAIClient = new OpenAIIntegration(openAIAPIKey);

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  console.log('message', message)

  // You can customize the trigger phrase or command for your bot
  if (message.content.startsWith('!lahey')) {

    async function processCommand() {
      const typingPromise = keepTyping(message.channel); // Start the typing indicator loop

      try {
        const prompt = `${message.content.slice(7)}`;
        const response = await laheyAIClient.laheyChat(prompt, INSTRUCTION);
        message.reply(response);
      } catch (error) {
        console.error('Error generating text from GPT:', error);
        message.reply('Looks like the sh*thawks got in the way, pal. Gimme a sec to sober up and try again.');
      } finally {
        // Cancel the typing indicator loop
        typingPromise.cancel();
      }
    }

    processCommand();

  }



});

function keepTyping(channel: any): CancelablePromise<void> {
  let hasCanceled = false;

  const typingLoop = async () => {
    while (!hasCanceled) {
      channel.sendTyping();
      await new Promise((resolve) => setTimeout(resolve, 9000));
    }
  };

  const cancelablePromise = makeCancelable<void>(typingLoop());

  cancelablePromise.cancel = () => {
    hasCanceled = true;
  };

  return cancelablePromise;
}

client.login(process.env.DISCORD_BOT_TOKEN);
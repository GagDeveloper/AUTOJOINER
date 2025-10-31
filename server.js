import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();
const port = process.env.PORT || 3000;
let latestJob = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", (msg) => {
  try {
    if (msg.mentions.everyone) {
      const match = msg.content.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      );
      if (match) {
        latestJob = { jobId: match[0], time: Date.now(), channel: msg.channelId };
        console.log("✅ Saved new Job ID:", latestJob.jobId);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
});

client.login(process.env.BOT_TOKEN);

app.get("/latestjob", (req, res) => {
  res.json(latestJob || { jobId: null });
});

app.get("/", (req, res) => res.send("✅ Bot is running! Visit /latestjob"));

app.listen(port, () => console.log(`Server running on port ${port}`));

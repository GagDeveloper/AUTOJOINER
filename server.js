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

function extractJobFromText(text) {
  if (!text) return null;
  const m = text.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  return m ? m[0] : null;
}

client.on("messageCreate", (msg) => {
  try {
    if (!msg) return;
    // only trigger on @everyone mentions
    if (msg.mentions && msg.mentions.everyone) {
      // 1) check content
      let job = extractJobFromText(msg.content);
      // 2) check embeds (description/title/fields)
      if (!job && msg.embeds && msg.embeds.length > 0) {
        for (const emb of msg.embeds) {
          job = extractJobFromText(emb.description) || extractJobFromText(emb.title);
          if (job) break;
          if (emb.fields && emb.fields.length > 0) {
            for (const f of emb.fields) {
              job = extractJobFromText(f.value) || extractJobFromText(f.name);
              if (job) break;
            }
            if (job) break;
          }
        }
      }
      if (job) {
        latestJob = { jobId: job, time: Date.now(), channel: msg.channelId };
        console.log("✅ Saved new Job ID:", latestJob.jobId);
      }
    }
  } catch (e) {
    console.error("Error reading message:", e);
  }
});

client.login(process.env.BOT_TOKEN);

app.get("/latestjob", (req, res) => {
  res.json(latestJob || { jobId: null });
});

app.get("/", (req, res) => res.send("✅ Bot is running! Visit /latestjob"));

app.listen(port, () => console.log(`Server running on port ${port}`));

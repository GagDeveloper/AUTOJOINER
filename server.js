const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

let latestJob = null;

app.get("/", (req, res) => {
  res.send("✅ AutoJoiner Bot is running! Visit /latestjob");
});

app.get("/latestjob", (req, res) => {
  res.json({ jobId: latestJob });
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = "1412099473546547232"; // <- Palitan ng Discord channel ID mo
const PLACE_ID = "127742093697776"; // <- Roblox Place ID mo

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.channel.id !== CHANNEL_ID) return;
    if (!message.mentions.everyone && !message.content.includes("@everyone")) return;

    // Try to find Job ID in text or embed
    let jobId = null;

    // Check embeds
    if (message.embeds.length > 0) {
      for (const emb of message.embeds) {
        if (emb.description) {
          const match = emb.description.match(/[0-9a-fA-F\-]{36}/);
          if (match) jobId = match[0];
        }
        if (!jobId && emb.fields) {
          for (const f of emb.fields) {
            const match = (f.value || "").match(/[0-9a-fA-F\-]{36}/);
            if (match) jobId = match[0];
          }
        }
      }
    }

    // Check plain text
    if (!jobId) {
      const match = message.content.match(/[0-9a-fA-F\-]{36}/);
      if (match) jobId = match[0];
    }

    if (jobId) {
      console.log(`🟢 Found Job ID: ${jobId}`);
      setTimeout(() => {
        latestJob = jobId;
        console.log(`✅ Saved Job ID: ${jobId}`);
      }, 1000); // 1 second delay
    }
  } catch (err) {
    console.error("⚠️ Error reading message:", err);
  }
});

client.login(process.env.BOT_TOKEN); // Your Discord bot token

app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

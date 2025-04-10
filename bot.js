const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`✅ Бот запущений як ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.content === '!list') {
    const allowedRoles = ["1352225611996725258", "1359148705852297296"];
    if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
      message.reply('You do not have permission to use this command.');
      return;
    }

    const guild = message.guild;
    await guild.members.fetch(); // важливо!

    const getRoleMembers = (roleId, label, emoji) => {
      const role = guild.roles.cache.get(roleId);
      if (!role) return `${emoji} **${label}** — роль не найдена\n`;
      const members = role.members.map(m => {
        const member = guild.members.cache.get(m.id);
        return `- <@${m.id}> | ${member.nickname || m.user.tag}`;
      });
      if (members.length === 0) return `${emoji} **${label}** — Отсутствует\n`;
      return `${emoji} **${label}**:\n${members.join('\n')}\n`;
    };

    const leaderList = getRoleMembers(process.env.ID_Leader, "Leader", "");
    const depLeaderList = getRoleMembers(process.env.ID_DepLeader, "Deputy Leader", "");
    const highStaffList = getRoleMembers(process.env.ID_HighStaff, "High Staff", "");
    const recruiterList = getRoleMembers(process.env.ID_Recruiter, "Recruiter", "");

    const finalMessage = `📋 **Состав 𝐒𝐓𝐀𝐅𝐅𝐎𝐑𝐃 & 𝐕𝐄𝐋𝐀𝐙𝐐𝐔𝐄𝐙:**\n\n${leaderList}\n${depLeaderList}\n${highStaffList}\n${recruiterList}`;

    const targetChannel = await client.channels.fetch(process.env.ID_Channel);

    // Delete previous bot messages
    try {
      const messages = await targetChannel.messages.fetch({ limit: 100 });
      const botMessages = messages.filter(m => m.author.id === client.user.id);

      await targetChannel.bulkDelete(botMessages, true);
      console.log(`Deleted ${botMessages.size} previous messages.`);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }

    const leaderEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(leaderList);
    targetChannel.send({ embeds: [leaderEmbed] });

    const depLeaderEmbed = new EmbedBuilder()
      .setColor(0x6d2ba6)
      .setDescription(depLeaderList);
    targetChannel.send({ embeds: [depLeaderEmbed] });

    const highStaffEmbed = new EmbedBuilder()
      .setColor(0x0080ff)
      .setDescription(highStaffList);
    targetChannel.send({ embeds: [highStaffEmbed] });

    const recruiterEmbed = new EmbedBuilder()
      .setColor(0x0046ff)
      .setDescription(recruiterList);
    targetChannel.send({ embeds: [recruiterEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);

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
    const allowedRoles = ["857734271741067264"];
    if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
      message.reply('You do not have permission to use this command.');
      return;
    }

    const guild = message.guild;
    await guild.members.fetch();

    const targetChannel = await client.channels.fetch(process.env.ID_Channel);

    // 🔢 ID ролей, які треба виводити
    const roleIds = [
      process.env.ID_Leader,
      process.env.ID_DepLeader,
      process.env.ID_HighStaff,
      process.env.ID_Recruiter,
      process.env.ID_Main,
    ];

    // 📊 Сортуємо ролі за Discord-позицією (від вищої до нижчої)
    const sortedRoles = roleIds
      .map(id => guild.roles.cache.get(id))
      .filter(Boolean)
      .sort((a, b) => b.position - a.position);

    const usedMembers = new Set();

    // 🧹 Чистимо попередні повідомлення бота
    try {
      const messages = await targetChannel.messages.fetch({ limit: 100 });
      const botMessages = messages.filter(m => m.author.id === client.user.id);
      await targetChannel.bulkDelete(botMessages, true);
      console.log(`🗑️ Deleted ${botMessages.size} previous messages.`);
    } catch (error) {
      console.error('❌ Error deleting messages:', error);
    }

    // 🔁 Генеруємо Embed для кожної ролі
    for (const role of sortedRoles) {
      const members = role.members.filter(m => !usedMembers.has(m.id));
      if (members.size === 0) continue;

      const list = [...members.values()].map((m, i) => {
        usedMembers.add(m.id);
        const name = m.nickname || m.user.username;
        return `${i + 1}. <@${m.id}> | ${name}`;
      });

      const embed = new EmbedBuilder()
        .setTitle(role.name)
        .setColor(role.color || 0x2f3136)
        .setDescription(list.join('\n'));

      await targetChannel.send({ embeds: [embed] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

const TelegramBot = require('node-telegram-bot-api');
const token = '7036221904:AAE7mdVIL68ms9KS4LfsJ3VG3jNwtOKW5RE';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, октагон!');
});
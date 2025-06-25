const TelegramBot = require('node-telegram-bot-api');
const token = '7036221904:AAE7mdVIL68ms9KS4LfsJ3VG3jNwtOKW5RE';
const bot = new TelegramBot(token, { polling: true });

//bot.on('message', (msg) => {
  //const chatId = msg.chat.id;
 // bot.sendMessage(chatId, 'Привет, октагон!');
//});
bot.onText(/\/help/, (msg) => {
  const helpText = `
Доступные команды:
/help — список команд с описанием
/site — ссылка на сайт проекта
/creator — информация о создателе
  `;
  bot.sendMessage(msg.chat.id, helpText);
});

bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Сайт проекта: https://octagon-students.ru/');
});

bot.onText(/\/creator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Создатель: Афанасьев Роман Витальевич');
});
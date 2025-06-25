const TelegramBot = require('node-telegram-bot-api');
const token = '7036221904:AAE7mdVIL68ms9KS4LfsJ3VG3jNwtOKW5RE';
const bot = new TelegramBot(token, { polling: true });
const { getRandomItem, getItemById, deleteItem } = require('./queries');

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
/randomItem — получить случайный предмет из базы данных
/getItemByID <id> — получить предмет по ID
/deleteItem <id> — удалить предмет по ID
  `;
  bot.sendMessage(msg.chat.id, helpText);
});

bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Сайт проекта: https://octagon-students.ru/');
});

bot.onText(/\/creator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Создатель: Афанасьев Роман Витальевич');
});

bot.onText(/\/randomItem/, async (msg) => {
  try {
    const item = await getRandomItem();
    if (!item) return bot.sendMessage(msg.chat.id, 'База данных пуста.');
    bot.sendMessage(msg.chat.id, `${item.id} - ${item.name}: ${item.description}`);
  } catch {
    bot.sendMessage(msg.chat.id, 'Ошибка при получении предмета.');
  }
});

bot.onText(/\/getItemByID (\d+)/, async (msg, match) => {
  try {
    const item = await getItemById(match[1]);
    if (!item) return bot.sendMessage(msg.chat.id, 'Такого предмета нет.');
    bot.sendMessage(msg.chat.id, `${item.id} - ${item.name}: ${item.description}`);
  } catch {
    bot.sendMessage(msg.chat.id, 'Ошибка при поиске предмета.');
  }
});

bot.onText(/\/deleteItem (\d+)/, async (msg, match) => {
  try {
    const deleted = await deleteItem(match[1]);
    const text = deleted ? 'Предмет удалён.' : 'Предмет не найден.';
    bot.sendMessage(msg.chat.id, text);
  } catch {
    bot.sendMessage(msg.chat.id, 'Ошибка при удалении.');
  }
});
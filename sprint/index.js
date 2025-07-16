require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const db = require('./database');
const { scheduleBroadcast } = require('./scheduler');
const { trackReaction } = require('./reactions');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const userId    = msg.from.id;
  const chatId    = msg.chat.id;
  const username  = typeof msg.from.username !== 'undefined' ? msg.from.username : null;
  const firstName = typeof msg.from.first_name !== 'undefined' ? msg.from.first_name : null;
  const lastName  = typeof msg.from.last_name !== 'undefined' ? msg.from.last_name : null;

  try {
    await db.execute(
      `INSERT INTO users (user_id, chat_id, username, first_name, last_name, registered_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         username = VALUES(username),
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         last_seen = NOW()`,
      [userId, chatId, username, firstName, lastName]
    );

    bot.sendMessage(chatId, `✅ Добро пожаловать, ${firstName || 'пользователь'}!`);
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    bot.sendMessage(chatId, '❌ Не удалось зарегистрироваться.');
  }
});

bot.onText(/\/broadcast_all\s+"(.+)"\s+(\d{1,2}:\d{2})/, async (msg, match) => {
  const [text, timeString] = match.slice(1);
  const [hours, minutes] = timeString.split(':').map(Number);

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);

  try {
    const [rows] = await db.query('SELECT user_id FROM users');
    const userIds = rows.map(r => r.user_id);
    const timestamp = target.getTime();

    scheduleBroadcast(bot, text, timestamp, userIds);
    bot.sendMessage(msg.chat.id, `📨 Рассылка всем запланирована на ${target.toLocaleString('ru-RU')}`);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    bot.sendMessage(msg.chat.id, '❌ Не удалось запланировать рассылку.');
  }
});

bot.on('callback_query', query => {
  trackReaction(query, bot);
});

bot.onText(/\/export_csv/, async msg => {
  try {
    const [rows] = await db.query('SELECT * FROM reactions');

    if (rows.length === 0) {
      return bot.sendMessage(msg.chat.id, '⛔️ В базе нет реакций.');
    }

    const header = 'id;user_id;reaction;timestamp';
    const body = rows.map(r => `${r.id};${r.user_id};${r.reaction};${r.timestamp.toISOString()}`);
    const csv = [header, ...body].join('\n');

    const buffer = Buffer.from(csv, 'utf-8');

    await bot.sendDocument(msg.chat.id, buffer, {}, {
      filename: `reactions_${Date.now()}.csv`,
      contentType: 'text/csv'
    });
  } catch (err) {
    console.error('❌ Ошибка экспорта CSV:', err);
    bot.sendMessage(msg.chat.id, 'Ошибка при экспорте данных.');
  }
});
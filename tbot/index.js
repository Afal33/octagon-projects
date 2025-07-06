const TelegramBot = require('node-telegram-bot-api');
const token = '7036221904:AAE7mdVIL68ms9KS4LfsJ3VG3jNwtOKW5RE';
const bot = new TelegramBot(token, { polling: true });
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
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
/qr - сгенерировать QR-код по тексту
/webscr <url> — сделать скриншот веб-страницы по URL
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
// Команды для QR-кода и скриншота веб-страницы
bot.onText(/qr (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text   = match[1];

  try {
    // Генерируем QR в буфер PNG
    const buffer = await QRCode.toBuffer(text, { width: 300 });
    await bot.sendPhoto(chatId, buffer, { caption: 'Ваш QR-код' });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Ошибка при генерации QR-кода.');
  }
});
// Команда для скриншота веб-страницы
bot.onText(/webscr (https?:\/\/\S+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url    = match[1];

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Делаем скриншот
    const buffer = await page.screenshot({ fullPage: true });
    await bot.sendPhoto(chatId, buffer, { caption: `Скриншот ${url}` });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Не удалось снять скриншот. Проверьте URL.');
  } finally {
    if (browser) await browser.close();
  }
});

const db = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'ChatBotTests'
});

bot.on('message', async msg => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    await db.execute(
      `INSERT INTO user_activity (user_id, last_message)
       VALUES (?, NOW())
       ON DUPLICATE KEY UPDATE last_message = NOW()`,
      [userId]
    );
  } catch (err) {
    console.error('DB error:', err);
  }
});

// случайные сообщения для пользователей, которые не писали >2 суток
const randomItems = [
  'Привет! Как дела?',
  'Надеюсь, у тебя отличный день!',
];

// Функция, отправляющая randomItem тем, кто не писал >2 суток
async function runDailyCheck() {
  try {
    const [rows] = await db.query(
      `SELECT user_id
       FROM user_activity
       WHERE last_message < DATE_SUB(NOW(), INTERVAL 2 DAY)`,
    );

    for (const { user_id } of rows) {
      const text = randomItems[Math.floor(Math.random() * randomItems.length)];
      await bot.sendMessage(user_id, text);
    }
  } catch (err) {
    console.error('Error in daily check:', err);
  }
}

// Запустить задачу в ближайшее 13:00 МСК, а затем каждые 24 ч
function scheduleDailyJob() {
  const now    = new Date();
  const target = new Date(now);
  target.setHours(13, 0, 0, 0);
  if (now > target) target.setDate(target.getDate() + 1);

  const msUntilTarget = target - now;

  setTimeout(() => {
    runDailyCheck();
    setIntervalAsync(runDailyCheck, 24 * 60 * 60 * 1000); 
  }, msUntilTarget);
}

scheduleDailyJob();

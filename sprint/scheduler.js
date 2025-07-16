const { setTimeout: delay } = require('timers/promises');
const { logBroadcast } = require('./reactions');

function scheduleBroadcast(bot, text, timestamp, recipients) {
  const delayMs = timestamp - Date.now();
  if (delayMs < 0) return;

  setTimeout(() => sendBatch(bot, text, recipients), delayMs);
}

async function sendBatch(bot, text, recipients) {
  const batchSize = 30;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await Promise.all(batch.map(userId => {
      const opts = {
        reply_markup: {
          inline_keyboard: [[
            { text: '👍 Интересно', callback_data: `like_${userId}` },
            { text: '👎 Не интересно', callback_data: `dislike_${userId}` }
          ]]
        }
      };
      return bot.sendMessage(userId, text, opts).then(() => logBroadcast(userId, text));
    }));
    await delay(1000); // 1 секунда между партиями
  }
}

module.exports = { scheduleBroadcast };
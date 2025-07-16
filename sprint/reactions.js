const db = require('./database');

function trackReaction(query, bot) {
  const userId = query.from.id;
  const reaction = query.data.startsWith('like') ? '👍' : '👎';
  db.execute(`
    INSERT INTO reactions (user_id, reaction, timestamp)
    VALUES (?, ?, NOW())
  `, [userId, reaction]);
  bot.answerCallbackQuery(query.id, { text: `Вы выбрали: ${reaction}` });
}

function logBroadcast(userId, text) {
  return db.execute(`
    INSERT INTO broadcast_log (user_id, message, sent_at)
    VALUES (?, ?, NOW())
  `, [userId, text]);
}

module.exports = { trackReaction, logBroadcast };
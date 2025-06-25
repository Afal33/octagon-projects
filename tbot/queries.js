const db = require('../database');

async function getRandomItem() {
  const [rows] = await db.query('SELECT * FROM items ORDER BY RAND() LIMIT 1');
  return rows[0];
}

async function getItemById(id) {
  const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [id]);
  return rows[0];
}

async function deleteItem(id) {
  const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  getRandomItem,
  getItemById,
  deleteItem
};
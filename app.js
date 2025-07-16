const express = require('express');
const app = express();
const routes = require('./routes/items.js');

app.use('/', routes);

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
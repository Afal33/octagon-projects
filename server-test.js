const express = require('express');
const app = express();
const port = 3000;

app.get('/static', (req, res) => {
  res.json({
    header: 'Hello',
    body: 'Octagon NodeJS Test'
  });
});

app.get('/dynamic', (req, res) => {
  const { a, b, c } = req.query;

  if (isNaN(Number(a)) || isNaN(Number(b)) || isNaN(Number(c))) {
    return res.json({ header: 'Error' });
  }

  const result = (Number(a) * Number(b) * Number(c)) / 3;

  res.json({
    header: 'Calculated',
    body: result.toString()
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
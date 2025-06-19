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

  const numA = Number(a);
  const numB = Number(b);
  const numC = Number(c);

  if (
    isNaN(numA) ||
    isNaN(numB) ||
    isNaN(numC)
  ) {
    return res.json({ header: 'Error' });
  }

  const result = (numA * numB * numC) / 3;

  res.json({
    header: 'Calculated',
    body: result.toString()
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
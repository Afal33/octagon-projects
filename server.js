const express = require('express');
const app = express();
const port = 3000;

const itemsRouter = require('./routes/items');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', itemsRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
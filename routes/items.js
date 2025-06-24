const express = require('express');
const router = express.Router();
const pool = require('../database');

// GET /getAllItems - получение всех элементов из таблицы items
router.get('/getAllItems', (req, res) => {
    pool.query('SELECT * FROM items', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(null);
        }
        res.json(results);
    });
});

// POST /addItem?name=TEXT&desc=TEXT2 - добавление нового элемента
router.post('/addItem', (req, res) => {
    const { name, desc } = req.query;
    
    if (!name || !desc) {
        return res.json(null);
    }
    
    const query = 'INSERT INTO items (name, `desc`) VALUES (?, ?)';
    pool.execute(query, [name, desc], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(null);
        }
        
        const insertedId = results.insertId;
        pool.query('SELECT * FROM items WHERE id = ?', [insertedId], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json(null);
            }
            if (rows.length === 0) {
                return res.json({});
            }
            res.json(rows[0]);
        });
    });
});

// POST /deleteItem?id=number - удаление элемента по id
router.post('/deleteItem', (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.json(null);
    }

    pool.query('SELECT * FROM items WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json(null);
        }
        if (rows.length === 0) {
            return res.json({});
        }
        const item = rows[0];
        pool.execute('DELETE FROM items WHERE id = ?', [id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json(null);
            }
            res.json(item);
        });
    });
});

// POST /updateItem?id=number&name=TEXT&desc=TEXT2 - обновление элемента
router.post('/updateItem', (req, res) => {
    const { id, name, desc } = req.query;
    if (!id || !name || !desc) {
        return res.json(null);
    }
    
    pool.query('SELECT * FROM items WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json(null);
        }
        if (rows.length === 0) {
            return res.json({});
        }
        pool.execute('UPDATE items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json(null);
            }
            pool.query('SELECT * FROM items WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json(null);
                }
                if (rows.length === 0) {
                    return res.json({});
                }
                res.json(rows[0]);
            });
        });
    });
});

module.exports = router;
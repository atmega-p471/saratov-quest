const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');

const router = express.Router();

// Регистрация
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Имя пользователя должно быть не менее 3 символов'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    body('full_name').optional().isLength({ min: 2 }).withMessage('Полное имя должно быть не менее 2 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, full_name } = req.body;

        // Проверяем, существует ли пользователь
        db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email],
            async (err, row) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка базы данных' });
                }

                if (row) {
                    return res.status(400).json({ message: 'Пользователь с таким именем или email уже существует' });
                }

                // Хешируем пароль
                const saltRounds = 10;
                const password_hash = await bcrypt.hash(password, saltRounds);

                // Создаем пользователя
                db.run(
                    'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                    [username, email, password_hash, full_name || ''],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ message: 'Ошибка создания пользователя' });
                        }

                        const userId = this.lastID;

                        // Создаем JWT токен
                        const token = jwt.sign(
                            { userId, username },
                            process.env.JWT_SECRET,
                            { expiresIn: '7d' }
                        );

                        res.status(201).json({
                            message: 'Пользователь успешно зарегистрирован',
                            token,
                            user: {
                                id: userId,
                                username,
                                email,
                                full_name: full_name || '',
                                points: 0,
                                level: 1,
                                is_premium: false
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Вход
router.post('/login', [
    body('login').notEmpty().withMessage('Введите имя пользователя или email'),
    body('password').notEmpty().withMessage('Введите пароль')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { login, password } = req.body;

        // Ищем пользователя по username или email
        db.get(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [login, login],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка базы данных' });
                }

                if (!user) {
                    return res.status(400).json({ message: 'Неверные учетные данные' });
                }

                // Проверяем пароль
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(400).json({ message: 'Неверные учетные данные' });
                }

                // Создаем JWT токен
                const token = jwt.sign(
                    { userId: user.id, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.json({
                    message: 'Успешный вход',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        full_name: user.full_name,
                        points: user.points,
                        level: user.level,
                        is_premium: user.is_premium,
                        avatar_url: user.avatar_url
                    }
                });
            }
        );
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Проверка токена
router.get('/me', (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        db.get(
            'SELECT id, username, email, full_name, points, level, is_premium, avatar_url FROM users WHERE id = ?',
            [decoded.userId],
            (err, user) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка базы данных' });
                }

                if (!user) {
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }

                res.json({ user });
            }
        );
    } catch (error) {
        res.status(401).json({ message: 'Неверный токен' });
    }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const auth = require('../middleware/auth');

const router = express.Router();

// Получить все места
router.get('/', (req, res) => {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM places WHERE 1=1';
    let params = [];
    
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    
    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY rating DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, places) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения мест' });
        }
        
        res.json({ places, total: places.length });
    });
});

// Получить место по ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM places WHERE id = ?', [id], (err, place) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }
        
        if (!place) {
            return res.status(404).json({ message: 'Место не найдено' });
        }
        
        // Получаем отзывы для места
        db.all(`
            SELECT r.*, u.username, u.avatar_url 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.place_id = ? 
            ORDER BY r.created_at DESC
        `, [id], (err, reviews) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения отзывов' });
            }
            
            res.json({ place: { ...place, reviews } });
        });
    });
});

// Создать новое место (только для аутентифицированных пользователей)
router.post('/', auth, [
    body('name').isLength({ min: 2 }).withMessage('Название должно быть не менее 2 символов'),
    body('category').notEmpty().withMessage('Категория обязательна'),
    body('latitude').isFloat().withMessage('Широта должна быть числом'),
    body('longitude').isFloat().withMessage('Долгота должна быть числом'),
    body('address').optional().isLength({ min: 5 }).withMessage('Адрес должен быть не менее 5 символов')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, latitude, longitude, address, phone, website, image_url } = req.body;
    const owner_id = req.user.userId;

    db.run(`
        INSERT INTO places (name, description, category, latitude, longitude, address, phone, website, image_url, owner_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description || '', category, latitude, longitude, address || '', phone || '', website || '', image_url || '', owner_id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка создания места' });
        }

        res.status(201).json({
            message: 'Место успешно создано',
            place: {
                id: this.lastID,
                name,
                description,
                category,
                latitude,
                longitude,
                address,
                phone,
                website,
                image_url,
                owner_id,
                rating: 0
            }
        });
    });
});

// Обновить место (только владелец)
router.put('/:id', auth, [
    body('name').optional().isLength({ min: 2 }).withMessage('Название должно быть не менее 2 символов'),
    body('category').optional().notEmpty().withMessage('Категория не может быть пустой'),
    body('latitude').optional().isFloat().withMessage('Широта должна быть числом'),
    body('longitude').optional().isFloat().withMessage('Долгота должна быть числом')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    // Проверяем, является ли пользователь владельцем места
    db.get('SELECT owner_id FROM places WHERE id = ?', [id], (err, place) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }

        if (!place) {
            return res.status(404).json({ message: 'Место не найдено' });
        }

        if (place.owner_id !== userId) {
            return res.status(403).json({ message: 'Нет прав для редактирования этого места' });
        }

        const { name, description, category, latitude, longitude, address, phone, website, image_url } = req.body;
        
        db.run(`
            UPDATE places 
            SET name = COALESCE(?, name), 
                description = COALESCE(?, description), 
                category = COALESCE(?, category),
                latitude = COALESCE(?, latitude),
                longitude = COALESCE(?, longitude),
                address = COALESCE(?, address),
                phone = COALESCE(?, phone),
                website = COALESCE(?, website),
                image_url = COALESCE(?, image_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, description, category, latitude, longitude, address, phone, website, image_url, id], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка обновления места' });
            }

            res.json({ message: 'Место успешно обновлено' });
        });
    });
});

// Добавить отзыв к месту
router.post('/:id/reviews', auth, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Комментарий не должен превышать 500 символов')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Проверяем, существует ли место
    db.get('SELECT id FROM places WHERE id = ?', [id], (err, place) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }

        if (!place) {
            return res.status(404).json({ message: 'Место не найдено' });
        }

        // Проверяем, не оставлял ли пользователь уже отзыв
        db.get('SELECT id FROM reviews WHERE user_id = ? AND place_id = ?', [userId, id], (err, existingReview) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка базы данных' });
            }

            if (existingReview) {
                return res.status(400).json({ message: 'Вы уже оставили отзыв для этого места' });
            }

            // Добавляем отзыв
            db.run('INSERT INTO reviews (user_id, place_id, rating, comment) VALUES (?, ?, ?, ?)', 
                [userId, id, rating, comment || ''], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка добавления отзыва' });
                }

                // Обновляем средний рейтинг места
                db.get('SELECT AVG(rating) as avg_rating FROM reviews WHERE place_id = ?', [id], (err, result) => {
                    if (!err && result.avg_rating) {
                        db.run('UPDATE places SET rating = ? WHERE id = ?', [Math.round(result.avg_rating * 10) / 10, id]);
                    }
                });

                res.status(201).json({
                    message: 'Отзыв успешно добавлен',
                    review: {
                        id: this.lastID,
                        rating,
                        comment,
                        user_id: userId,
                        place_id: id
                    }
                });
            });
        });
    });
});

// Получить категории мест
router.get('/categories/list', (req, res) => {
    const categories = [
        { id: 'restaurant', name: 'Рестораны', icon: '🍽️' },
        { id: 'cafe', name: 'Кафе', icon: '☕' },
        { id: 'park', name: 'Парки', icon: '🌳' },
        { id: 'museum', name: 'Музеи', icon: '🏛️' },
        { id: 'culture', name: 'Культура', icon: '🎭' },
        { id: 'attraction', name: 'Достопримечательности', icon: '🏰' },
        { id: 'shopping', name: 'Шоппинг', icon: '🛍️' },
        { id: 'entertainment', name: 'Развлечения', icon: '🎮' },
        { id: 'sport', name: 'Спорт', icon: '⚽' },
        { id: 'hotel', name: 'Отели', icon: '🏨' }
    ];
    
    res.json({ categories });
});

module.exports = router;

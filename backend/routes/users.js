const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const auth = require('../middleware/auth');

const router = express.Router();

// Получить профиль пользователя
router.get('/profile', auth, (req, res) => {
    const userId = req.user.userId;
    
    db.get(`
        SELECT id, username, email, full_name, points, level, is_premium, avatar_url, created_at
        FROM users WHERE id = ?
    `, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        // Получаем статистику пользователя
        const statsQuery = `
            SELECT 
                COUNT(uq.id) as quests_completed,
                COUNT(DISTINCT q.category) as categories_explored,
                COUNT(r.id) as reviews_written,
                COUNT(ua.id) as achievements_earned
            FROM users u
            LEFT JOIN user_quests uq ON u.id = uq.user_id
            LEFT JOIN quests q ON uq.quest_id = q.id
            LEFT JOIN reviews r ON u.id = r.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            WHERE u.id = ?
        `;
        
        db.get(statsQuery, [userId], (err, stats) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения статистики' });
            }
            
            res.json({ 
                user: {
                    ...user,
                    stats: stats || {
                        quests_completed: 0,
                        categories_explored: 0,
                        reviews_written: 0,
                        achievements_earned: 0
                    }
                }
            });
        });
    });
});

// Обновить профиль пользователя
router.put('/profile', auth, [
    body('full_name').optional().isLength({ min: 2 }).withMessage('Полное имя должно быть не менее 2 символов'),
    body('avatar_url').optional().isURL().withMessage('Неверный формат URL аватара')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { full_name, avatar_url } = req.body;

    db.run(`
        UPDATE users 
        SET full_name = COALESCE(?, full_name), 
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [full_name, avatar_url, userId], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка обновления профиля' });
        }

        res.json({ message: 'Профиль успешно обновлен' });
    });
});

// Получить достижения пользователя
router.get('/achievements', auth, (req, res) => {
    const userId = req.user.userId;
    
    // Получаем все достижения пользователя
    const earnedQuery = `
        SELECT a.*, ua.earned_at
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        ORDER BY ua.earned_at DESC
    `;
    
    db.all(earnedQuery, [userId], (err, earnedAchievements) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения достижений' });
        }
        
        // Получаем все доступные достижения
        db.all('SELECT * FROM achievements ORDER BY points_required ASC', [], (err, allAchievements) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения списка достижений' });
            }
            
            // Получаем текущие баллы пользователя
            db.get('SELECT points FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка получения баллов пользователя' });
                }
                
                const userPoints = user ? user.points : 0;
                const earnedIds = new Set(earnedAchievements.map(a => a.id));
                
                // Разделяем достижения на полученные и доступные
                const available = allAchievements.filter(a => 
                    !earnedIds.has(a.id) && userPoints >= a.points_required
                );
                
                const locked = allAchievements.filter(a => 
                    !earnedIds.has(a.id) && userPoints < a.points_required
                );
                
                res.json({
                    earned: earnedAchievements,
                    available: available,
                    locked: locked,
                    user_points: userPoints
                });
            });
        });
    });
});

// Получить рейтинг пользователей
router.get('/leaderboard', (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    
    const query = `
        SELECT 
            u.id, 
            u.username, 
            u.full_name, 
            u.avatar_url, 
            u.points, 
            u.level,
            COUNT(uq.id) as quests_completed
        FROM users u
        LEFT JOIN user_quests uq ON u.id = uq.user_id
        GROUP BY u.id
        ORDER BY u.points DESC, u.level DESC
        LIMIT ? OFFSET ?
    `;
    
    db.all(query, [parseInt(limit), parseInt(offset)], (err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения рейтинга' });
        }
        
        // Добавляем позицию в рейтинге
        const leaderboard = users.map((user, index) => ({
            ...user,
            position: parseInt(offset) + index + 1
        }));
        
        res.json({ leaderboard });
    });
});

// Получить позицию пользователя в рейтинге
router.get('/rank', auth, (req, res) => {
    const userId = req.user.userId;
    
    const query = `
        SELECT COUNT(*) + 1 as rank
        FROM users u1
        JOIN users u2 ON u2.id = ?
        WHERE u1.points > u2.points 
        OR (u1.points = u2.points AND u1.level > u2.level)
        OR (u1.points = u2.points AND u1.level = u2.level AND u1.id < u2.id)
    `;
    
    db.get(query, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения позиции в рейтинге' });
        }
        
        // Получаем общее количество пользователей
        db.get('SELECT COUNT(*) as total FROM users', [], (err, total) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения общего количества пользователей' });
            }
            
            res.json({ 
                rank: result.rank,
                total_users: total.total
            });
        });
    });
});

// Получить активность пользователя (последние действия)
router.get('/activity', auth, (req, res) => {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;
    
    // Получаем последние выполненные квесты
    const questsQuery = `
        SELECT 
            'quest_completed' as type,
            q.title as title,
            uq.points_earned as points,
            uq.completed_at as date,
            p.name as place_name
        FROM user_quests uq
        JOIN quests q ON uq.quest_id = q.id
        LEFT JOIN places p ON q.place_id = p.id
        WHERE uq.user_id = ?
    `;
    
    // Получаем последние отзывы
    const reviewsQuery = `
        SELECT 
            'review_added' as type,
            p.name as title,
            r.rating as rating,
            r.created_at as date,
            NULL as points
        FROM reviews r
        JOIN places p ON r.place_id = p.id
        WHERE r.user_id = ?
    `;
    
    // Получаем последние достижения
    const achievementsQuery = `
        SELECT 
            'achievement_earned' as type,
            a.name as title,
            NULL as rating,
            ua.earned_at as date,
            NULL as points
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
    `;
    
    const unionQuery = `
        ${questsQuery}
        UNION ALL
        ${reviewsQuery}
        UNION ALL
        ${achievementsQuery}
        ORDER BY date DESC
        LIMIT ?
    `;
    
    db.all(unionQuery, [userId, userId, userId, parseInt(limit)], (err, activities) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения активности' });
        }
        
        res.json({ activities });
    });
});

// Активировать Premium подписку
router.post('/premium/activate', auth, [
    body('plan_type').isIn(['monthly', 'yearly']).withMessage('Тип плана должен быть monthly или yearly')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { plan_type } = req.body;
    
    const prices = {
        monthly: 299,
        yearly: 1999
    };
    
    const price = prices[plan_type];
    const endDate = plan_type === 'monthly' ? 
        "datetime('now', '+1 month')" : 
        "datetime('now', '+1 year')";
    
    // В реальном приложении здесь была бы интеграция с платежной системой
    // Для демо просто активируем подписку
    
    db.run(`
        INSERT INTO business_subscriptions (user_id, plan_type, price, end_date) 
        VALUES (?, ?, ?, ${endDate})
    `, [userId, plan_type, price], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Ошибка активации подписки' });
        }
        
        // Обновляем статус Premium у пользователя
        db.run('UPDATE users SET is_premium = 1 WHERE id = ?', [userId], (err) => {
            if (err) {
                console.error('Ошибка обновления Premium статуса:', err);
            }
        });
        
        res.json({
            message: 'Premium подписка успешно активирована',
            subscription: {
                id: this.lastID,
                plan_type,
                price
            }
        });
    });
});

module.exports = router;

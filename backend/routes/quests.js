const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const auth = require('../middleware/auth');

const router = express.Router();

// Получить все активные квесты
router.get('/', (req, res) => {
    const { category, difficulty, limit = 20, offset = 0 } = req.query;
    
    let query = `
        SELECT q.*, p.name as place_name, p.latitude, p.longitude, p.address 
        FROM quests q 
        LEFT JOIN places p ON q.place_id = p.id 
        WHERE q.is_active = 1
    `;
    let params = [];
    
    if (category) {
        query += ' AND q.category = ?';
        params.push(category);
    }
    
    if (difficulty) {
        query += ' AND q.difficulty = ?';
        params.push(parseInt(difficulty));
    }
    
    query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, quests) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения квестов' });
        }
        
        res.json({ quests });
    });
});

// Получить квесты пользователя (выполненные и доступные)
router.get('/my', auth, (req, res) => {
    const userId = req.user.userId;
    
    // Получаем выполненные квесты
    const completedQuery = `
        SELECT q.*, uq.completed_at, uq.points_earned, p.name as place_name 
        FROM user_quests uq 
        JOIN quests q ON uq.quest_id = q.id 
        LEFT JOIN places p ON q.place_id = p.id 
        WHERE uq.user_id = ? 
        ORDER BY uq.completed_at DESC
    `;
    
    db.all(completedQuery, [userId], (err, completedQuests) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения выполненных квестов' });
        }
        
        // Получаем доступные квесты (не выполненные пользователем)
        const availableQuery = `
            SELECT q.*, p.name as place_name, p.latitude, p.longitude, p.address 
            FROM quests q 
            LEFT JOIN places p ON q.place_id = p.id 
            WHERE q.is_active = 1 
            AND q.id NOT IN (
                SELECT quest_id FROM user_quests WHERE user_id = ?
            )
            ORDER BY q.difficulty ASC, q.points_reward DESC
        `;
        
        db.all(availableQuery, [userId], (err, availableQuests) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения доступных квестов' });
            }
            
            res.json({ 
                completed: completedQuests, 
                available: availableQuests 
            });
        });
    });
});

// Получить квест по ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT q.*, p.name as place_name, p.latitude, p.longitude, p.address, p.image_url as place_image 
        FROM quests q 
        LEFT JOIN places p ON q.place_id = p.id 
        WHERE q.id = ?
    `;
    
    db.get(query, [id], (err, quest) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }
        
        if (!quest) {
            return res.status(404).json({ message: 'Квест не найден' });
        }
        
        res.json({ quest });
    });
});

// Выполнить квест
router.post('/:id/complete', auth, (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Проверяем, существует ли квест и активен ли он
    db.get('SELECT * FROM quests WHERE id = ? AND is_active = 1', [id], (err, quest) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка базы данных' });
        }
        
        if (!quest) {
            return res.status(404).json({ message: 'Квест не найден или неактивен' });
        }
        
        // Проверяем, не выполнял ли пользователь уже этот квест
        db.get('SELECT id FROM user_quests WHERE user_id = ? AND quest_id = ?', [userId, id], (err, existingQuest) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка базы данных' });
            }
            
            if (existingQuest) {
                return res.status(400).json({ message: 'Вы уже выполнили этот квест' });
            }
            
            // Добавляем выполненный квест
            db.run('INSERT INTO user_quests (user_id, quest_id, points_earned) VALUES (?, ?, ?)', 
                [userId, id, quest.points_reward], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка выполнения квеста' });
                }
                
                // Обновляем баллы пользователя
                db.run('UPDATE users SET points = points + ? WHERE id = ?', [quest.points_reward, userId], (err) => {
                    if (err) {
                        console.error('Ошибка обновления баллов пользователя:', err);
                    }
                    
                    // Проверяем, нужно ли повысить уровень пользователя
                    db.get('SELECT points, level FROM users WHERE id = ?', [userId], (err, user) => {
                        if (!err && user) {
                            const newLevel = Math.floor(user.points / 100) + 1; // Каждые 100 баллов = новый уровень
                            if (newLevel > user.level) {
                                db.run('UPDATE users SET level = ? WHERE id = ?', [newLevel, userId]);
                            }
                        }
                    });
                });
                
                res.json({
                    message: 'Квест успешно выполнен!',
                    points_earned: quest.points_reward,
                    quest: {
                        id: quest.id,
                        title: quest.title,
                        points_reward: quest.points_reward
                    }
                });
            });
        });
    });
});

// Создать новый квест (для администраторов и владельцев бизнеса)
router.post('/', auth, [
    body('title').isLength({ min: 5 }).withMessage('Название квеста должно быть не менее 5 символов'),
    body('description').isLength({ min: 10 }).withMessage('Описание должно быть не менее 10 символов'),
    body('category').notEmpty().withMessage('Категория обязательна'),
    body('points_reward').isInt({ min: 1, max: 1000 }).withMessage('Награда должна быть от 1 до 1000 баллов'),
    body('difficulty').isInt({ min: 1, max: 5 }).withMessage('Сложность должна быть от 1 до 5'),
    body('place_id').optional().isInt().withMessage('ID места должно быть числом')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, points_reward, difficulty, place_id } = req.body;

    // Если указано место, проверяем его существование
    if (place_id) {
        db.get('SELECT id FROM places WHERE id = ?', [place_id], (err, place) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка базы данных' });
            }
            
            if (!place) {
                return res.status(404).json({ message: 'Указанное место не найдено' });
            }
            
            createQuest();
        });
    } else {
        createQuest();
    }
    
    function createQuest() {
        db.run(`
            INSERT INTO quests (title, description, category, points_reward, difficulty, place_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, description, category, points_reward, difficulty, place_id || null], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Ошибка создания квеста' });
            }

            res.status(201).json({
                message: 'Квест успешно создан',
                quest: {
                    id: this.lastID,
                    title,
                    description,
                    category,
                    points_reward,
                    difficulty,
                    place_id,
                    is_active: true
                }
            });
        });
    }
});

// Получить статистику по квестам пользователя
router.get('/stats/my', auth, (req, res) => {
    const userId = req.user.userId;
    
    const statsQuery = `
        SELECT 
            COUNT(*) as total_completed,
            SUM(points_earned) as total_points,
            COUNT(CASE WHEN q.difficulty = 1 THEN 1 END) as easy_completed,
            COUNT(CASE WHEN q.difficulty = 2 THEN 1 END) as medium_completed,
            COUNT(CASE WHEN q.difficulty = 3 THEN 1 END) as hard_completed,
            COUNT(CASE WHEN q.difficulty >= 4 THEN 1 END) as expert_completed
        FROM user_quests uq
        JOIN quests q ON uq.quest_id = q.id
        WHERE uq.user_id = ?
    `;
    
    db.get(statsQuery, [userId], (err, stats) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения статистики' });
        }
        
        // Получаем информацию о категориях
        const categoryQuery = `
            SELECT q.category, COUNT(*) as count
            FROM user_quests uq
            JOIN quests q ON uq.quest_id = q.id
            WHERE uq.user_id = ?
            GROUP BY q.category
            ORDER BY count DESC
        `;
        
        db.all(categoryQuery, [userId], (err, categories) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения статистики по категориям' });
            }
            
            res.json({ 
                stats: stats || {
                    total_completed: 0,
                    total_points: 0,
                    easy_completed: 0,
                    medium_completed: 0,
                    hard_completed: 0,
                    expert_completed: 0
                },
                categories: categories || []
            });
        });
    });
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

// Инициализация OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Системный промпт для ВОЛГА
const SYSTEM_PROMPT = `Ты - ВОЛГА (Виртуальный Организатор Локальных Городских Активностей), AI-ассистент туристической платформы "Саратов Quest". 

Твоя роль:
- Помогать туристам и жителям исследовать Саратов
- Рекомендовать интересные места, рестораны, развлечения
- Составлять персональные маршруты
- Давать советы по бюджету и времени
- Отвечать на любые вопросы о городе

Стиль общения:
- Дружелюбный и энтузиастичный
- Используй эмодзи для живости
- Давай конкретные рекомендации с адресами
- Учитывай бюджет и предпочтения пользователя
- Всегда предлагай несколько вариантов

Знания о Саратове:
- Исторические достопримечательности: Радищевский музей, Консерватория им. Собинова, особняки на проспекте Кирова
- Природные места: Парк Липки, Набережная Космонавтов, Соколовая гора, Волга
- Рестораны: от бюджетных кафе до премиум-заведений
- Развлечения: театры, музеи, парки, торговые центры
- Транспорт: трамваи, автобусы, такси

Отвечай на русском языке, будь полезным и вдохновляющим!`;

// Симуляция ИИ-ответов (fallback для случаев без OpenAI API)
const aiResponses = {
    greeting: [
        "Привет! Я Волга, ваш виртуальный помощник по Саратову! Готов помочь вам исследовать наш прекрасный город. Что вас интересует?",
        "Добро пожаловать в Саратов! Меня зовут Волга, и я знаю все самые интересные места города. Чем могу помочь?",
        "Здравствуйте! Волга на связи. Расскажу вам о лучших местах Саратова и помогу составить маршрут. О чем хотите узнать?"
    ],
    restaurant: [
        "В Саратове много отличных ресторанов! Рекомендую попробовать местную кухню в ресторане 'Волжский берег' или современную европейскую в 'Гастрономе'. А какую кухню предпочитаете?",
        "Для романтического ужина советую ресторан с видом на Волгу. Если хотите что-то более демократичное - множество уютных кафе в центре города. Какой у вас бюджет?",
        "Саратов славится своими рыбными блюдами! Обязательно попробуйте волжскую стерлядь. Могу порекомендовать несколько мест, где её готовят особенно вкусно."
    ],
    attractions: [
        "Главные достопримечательности Саратова: Парк Липки, Набережная Космонавтов, Саратовская консерватория и Радищевский музей. Что вас больше интересует - история, культура или природа?",
        "Обязательно посетите смотровую площадку на Соколовой горе - оттуда открывается потрясающий вид на город и Волгу! А еще рекомендую прогуляться по проспекту Кирова.",
        "В Саратове богатая история! Советую начать с центра города, где сохранились купеческие особняки XIX века. Интересуетесь архитектурой?"
    ],
    weather: [
        "Сегодня отличная погода для прогулок по городу! Рекомендую посетить набережную или один из парков.",
        "Если погода не располагает к прогулкам, советую посетить музеи или торговые центры. В Саратове много интересных крытых локаций!",
        "При любой погоде в Саратове найдется что посмотреть! Дождь - повод зайти в уютное кафе, солнце - прогуляться по набережной."
    ],
    budget: [
        "В Саратове можно отлично провести время с любым бюджетом! Много бесплатных мест: парки, набережная, архитектурные памятники. Какой у вас примерный бюджет на день?",
        "Для экономного отдыха рекомендую: прогулки по центру, посещение бесплатных выставок, пикник в парке. А для комфортного отдыха - рестораны и развлекательные центры.",
        "Студенческий бюджет? Не проблема! В Саратове много доступных кафе, есть льготы в музеях, а природные красоты бесплатны для всех!"
    ]
};

// Чат с ИИ-ассистентом
router.post('/chat', [
    body('message').isLength({ min: 1, max: 500 }).withMessage('Сообщение должно быть от 1 до 500 символов')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    
    console.log('Получен запрос к AI API:');
    console.log('Body:', JSON.stringify(req.body));
    console.log('Message:', JSON.stringify(message));
    console.log('Message length:', message ? message.length : 'undefined');
    
    try {
        // Создаем временного пользователя для тестирования
        const tempUser = {
            username: 'Гость',
            points: 0,
            level: 1,
            is_premium: false
        };
        
        const response = await generateAIResponse(message, tempUser);
        
        res.json({
            response: response,
            suggestions: generateSuggestions(message),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Ошибка ИИ чата:', error);
        res.status(500).json({ message: 'Ошибка обработки запроса' });
    }
});

// Получить персональные рекомендации
router.get('/recommendations', auth, (req, res) => {
    const userId = req.user.userId;
    const { category, mood, time_of_day, weather } = req.query;
    
    // Получаем предпочтения пользователя на основе его активности
    const userPreferencesQuery = `
        SELECT 
            q.category,
            COUNT(*) as frequency,
            AVG(uq.points_earned) as avg_points
        FROM user_quests uq
        JOIN quests q ON uq.quest_id = q.id
        WHERE uq.user_id = ?
        GROUP BY q.category
        ORDER BY frequency DESC, avg_points DESC
    `;
    
    db.all(userPreferencesQuery, [userId], (err, preferences) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения предпочтений' });
        }
        
        // Получаем рекомендации мест на основе предпочтений
        let placesQuery = `
            SELECT p.*, AVG(r.rating) as avg_rating
            FROM places p
            LEFT JOIN reviews r ON p.id = r.place_id
        `;
        let params = [];
        
        if (category) {
            placesQuery += ' WHERE p.category = ?';
            params.push(category);
        } else if (preferences.length > 0) {
            const preferredCategories = preferences.slice(0, 3).map(p => p.category);
            placesQuery += ` WHERE p.category IN (${preferredCategories.map(() => '?').join(',')})`;
            params.push(...preferredCategories);
        }
        
        placesQuery += ` 
            GROUP BY p.id
            ORDER BY avg_rating DESC, p.rating DESC
            LIMIT 10
        `;
        
        db.all(placesQuery, params, (err, recommendedPlaces) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка получения рекомендаций мест' });
            }
            
            // Получаем рекомендации квестов
            const questsQuery = `
                SELECT q.*, p.name as place_name
                FROM quests q
                LEFT JOIN places p ON q.place_id = p.id
                WHERE q.is_active = 1
                AND q.id NOT IN (
                    SELECT quest_id FROM user_quests WHERE user_id = ?
                )
                ORDER BY q.points_reward DESC, q.difficulty ASC
                LIMIT 5
            `;
            
            db.all(questsQuery, [userId], (err, recommendedQuests) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка получения рекомендаций квестов' });
                }
                
                const recommendations = {
                    places: recommendedPlaces,
                    quests: recommendedQuests,
                    message: generateRecommendationMessage(category, mood, time_of_day, weather),
                    user_preferences: preferences
                };
                
                res.json({ recommendations });
            });
        });
    });
});

// Получить маршрут
router.post('/route', auth, [
    body('preferences').optional().isArray().withMessage('Предпочтения должны быть массивом'),
    body('duration').optional().isInt({ min: 1, max: 12 }).withMessage('Длительность должна быть от 1 до 12 часов'),
    body('start_location').optional().isObject().withMessage('Начальная точка должна быть объектом с координатами')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { preferences = [], duration = 4, start_location } = req.body;
    
    // Получаем места по предпочтениям пользователя
    let query = 'SELECT * FROM places WHERE 1=1';
    let params = [];
    
    if (preferences.length > 0) {
        query += ` AND category IN (${preferences.map(() => '?').join(',')})`;
        params.push(...preferences);
    }
    
    query += ' ORDER BY rating DESC LIMIT 10';
    
    db.all(query, params, (err, places) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка получения мест для маршрута' });
        }
        
        // Простой алгоритм составления маршрута
        const route = createOptimalRoute(places, duration, start_location);
        
        res.json({
            route: {
                places: route,
                estimated_duration: duration,
                total_distance: calculateTotalDistance(route),
                description: `Персональный маршрут на ${duration} часов по интересным местам Саратова`
            }
        });
    });
});

// Вспомогательные функции

async function generateAIResponse(message, user) {
    try {
        // Если есть OpenAI API ключ, используем реальный AI
        if (process.env.OPENAI_API_KEY) {
            const userContext = `Пользователь: ${user.username}, уровень: ${user.level}, ${user.is_premium ? 'Premium' : 'обычный'} пользователь, очки: ${user.points}`;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `${userContext}\n\nВопрос: ${message}` }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            return completion.choices[0].message.content;
        }
    } catch (error) {
        console.error('Ошибка OpenAI API:', error);
    }

    // Fallback к заготовленным ответам
    return generateFallbackResponse(message, user);
}

function generateFallbackResponse(message, user) {
    const lowerMessage = message.toLowerCase();
    
    // Персонализированное приветствие
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
        const greeting = aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
        return user.is_premium ? 
            `${greeting} Как Premium пользователь, у вас есть доступ к эксклюзивным рекомендациям!` :
            greeting;
    }
    
    // Рестораны и еда
    if (lowerMessage.includes('ресторан') || lowerMessage.includes('поесть') || lowerMessage.includes('еда')) {
        return aiResponses.restaurant[Math.floor(Math.random() * aiResponses.restaurant.length)];
    }
    
    // Достопримечательности
    if (lowerMessage.includes('достопримечательност') || lowerMessage.includes('посмотреть') || lowerMessage.includes('музей')) {
        return aiResponses.attractions[Math.floor(Math.random() * aiResponses.attractions.length)];
    }
    
    // Погода
    if (lowerMessage.includes('погода') || lowerMessage.includes('дождь') || lowerMessage.includes('солнце')) {
        return aiResponses.weather[Math.floor(Math.random() * aiResponses.weather.length)];
    }
    
    // Бюджет
    if (lowerMessage.includes('бюджет') || lowerMessage.includes('деньги') || lowerMessage.includes('дешево')) {
        return aiResponses.budget[Math.floor(Math.random() * aiResponses.budget.length)];
    }
    
    // Общий ответ
    return `Интересный вопрос! В Саратове много возможностей для отдыха и развлечений. Могу порекомендовать посетить центр города, набережную или один из парков. А что именно вас интересует - культура, природа, еда или развлечения?`;
}

function generateSuggestions(message) {
    const suggestions = [
        "Где поесть в Саратове?",
        "Что посмотреть в городе?",
        "Составь маршрут на день",
        "Посоветуй недорогие места",
        "Где красиво сфотографироваться?"
    ];
    
    return suggestions.slice(0, 3);
}

function generateRecommendationMessage(category, mood, time_of_day, weather) {
    let message = "На основе ваших предпочтений рекомендую: ";
    
    if (time_of_day === 'morning') {
        message += "Утром лучше всего посетить парки или набережную. ";
    } else if (time_of_day === 'evening') {
        message += "Вечером советую рестораны или культурные мероприятия. ";
    }
    
    if (mood === 'active') {
        message += "Для активного отдыха подойдут квесты и прогулки по городу.";
    } else if (mood === 'relaxed') {
        message += "Для спокойного отдыха рекомендую кафе и музеи.";
    }
    
    return message;
}

function createOptimalRoute(places, duration, startLocation) {
    // Простая логика маршрута - выбираем топ места по рейтингу
    const selectedPlaces = places.slice(0, Math.min(places.length, Math.floor(duration / 1.5)));
    
    return selectedPlaces.map((place, index) => ({
        ...place,
        order: index + 1,
        estimated_time: duration / selectedPlaces.length
    }));
}

function calculateTotalDistance(route) {
    // Упрощенный расчет расстояния
    return route.length * 2; // примерно 2 км между точками
}

module.exports = router;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite';

// Создание подключения к базе данных
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('✅ Подключение к SQLite базе данных установлено');
        initializeTables();
    }
});

// Инициализация таблиц
function initializeTables() {
    // Таблица пользователей
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            avatar_url VARCHAR(255),
            points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            is_premium BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица мест/заведений
    db.run(`
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            address VARCHAR(255),
            phone VARCHAR(20),
            website VARCHAR(255),
            rating REAL DEFAULT 0,
            image_url VARCHAR(255),
            is_premium BOOLEAN DEFAULT FALSE,
            owner_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    `);

    // Таблица квестов
    db.run(`
        CREATE TABLE IF NOT EXISTS quests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            points_reward INTEGER DEFAULT 10,
            difficulty INTEGER DEFAULT 1,
            place_id INTEGER,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (place_id) REFERENCES places (id)
        )
    `);

    // Таблица выполненных квестов пользователями
    db.run(`
        CREATE TABLE IF NOT EXISTS user_quests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quest_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            points_earned INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (quest_id) REFERENCES quests (id),
            UNIQUE(user_id, quest_id)
        )
    `);

    // Таблица отзывов о местах
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            place_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (place_id) REFERENCES places (id)
        )
    `);

    // Таблица достижений
    db.run(`
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            points_required INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица достижений пользователей
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (achievement_id) REFERENCES achievements (id),
            UNIQUE(user_id, achievement_id)
        )
    `);

    // Таблица подписок для бизнеса
    db.run(`
        CREATE TABLE IF NOT EXISTS business_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_type VARCHAR(20) NOT NULL, -- 'basic', 'advanced', 'premium'
            price INTEGER NOT NULL,
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_date DATETIME,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    console.log('📊 Таблицы базы данных инициализированы');
    
    // Добавляем начальные данные
    insertInitialData();
}

// Добавление начальных данных
function insertInitialData() {
    // Добавляем достижения
    const achievements = [
        { name: 'Первые шаги', description: 'Зарегистрировались в приложении', icon: '🎯', points_required: 0 },
        { name: 'Исследователь', description: 'Посетили 5 мест', icon: '🗺️', points_required: 50 },
        { name: 'Гурман', description: 'Посетили 10 ресторанов', icon: '🍽️', points_required: 100 },
        { name: 'Знаток Саратова', description: 'Набрали 500 баллов', icon: '🏆', points_required: 500 },
        { name: 'Мастер квестов', description: 'Выполнили 20 квестов', icon: '⭐', points_required: 200 }
    ];

    achievements.forEach(achievement => {
        db.run(`
            INSERT OR IGNORE INTO achievements (name, description, icon, points_required) 
            VALUES (?, ?, ?, ?)
        `, [achievement.name, achievement.description, achievement.icon, achievement.points_required]);
    });

    // Добавляем тестовые места Саратова
    const places = [
        {
            name: 'Парк Липки',
            description: 'Старейший парк Саратова с красивыми аллеями',
            category: 'park',
            latitude: 51.533562,
            longitude: 46.034266,
            address: 'ул. Радищева, Саратов',
            rating: 4.5
        },
        {
            name: 'Саратовская консерватория',
            description: 'Знаменитая консерватория имени Л.В. Собинова',
            category: 'culture',
            latitude: 51.533333,
            longitude: 46.008889,
            address: 'пр. Кирова, 1, Саратов',
            rating: 4.8
        },
        {
            name: 'Набережная Космонавтов',
            description: 'Живописная набережная Волги',
            category: 'attraction',
            latitude: 51.520833,
            longitude: 46.030556,
            address: 'Набережная Космонавтов, Саратов',
            rating: 4.6
        }
    ];

    places.forEach(place => {
        db.run(`
            INSERT OR IGNORE INTO places (name, description, category, latitude, longitude, address, rating) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [place.name, place.description, place.category, place.latitude, place.longitude, place.address, place.rating]);
    });

    // Добавляем тестовые квесты
    const quests = [
        {
            title: 'Прогулка по Липкам',
            description: 'Посетите старейший парк города и сделайте фото у фонтана',
            category: 'walk',
            points_reward: 20,
            difficulty: 1,
            place_id: 1
        },
        {
            title: 'Культурный вечер',
            description: 'Посетите концерт в консерватории',
            category: 'culture',
            points_reward: 50,
            difficulty: 2,
            place_id: 2
        },
        {
            title: 'Волжские виды',
            description: 'Прогуляйтесь по набережной и насладитесь видом на Волгу',
            category: 'nature',
            points_reward: 30,
            difficulty: 1,
            place_id: 3
        }
    ];

    quests.forEach(quest => {
        db.run(`
            INSERT OR IGNORE INTO quests (title, description, category, points_reward, difficulty, place_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [quest.title, quest.description, quest.category, quest.points_reward, quest.difficulty, quest.place_id]);
    });

    console.log('🌱 Начальные данные добавлены в базу данных');
}

module.exports = db;

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация базы данных
const db = require('./database/init');

// Маршруты
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const questsRoutes = require('./routes/quests');
const usersRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);

// Статические файлы (если нужно)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}

// Базовый маршрут
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Саратов Quest API работает!', 
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            places: '/api/places',
            quests: '/api/quests',
            users: '/api/users',
            ai: '/api/ai'
        }
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Что-то пошло не так!', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера'
    });
});

// 404 обработчик
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📍 API доступно по адресу: http://localhost:${PORT}/api`);
});

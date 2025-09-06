import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  LocationOn as LocationIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';

const QuestsPage: React.FC = () => {
  // Мок данные для квестов
  const availableQuests = [
    {
      id: 1,
      title: 'Прогулка по Липкам',
      description: 'Посетите старейший парк города и сделайте фото у фонтана',
      category: 'walk',
      points_reward: 20,
      difficulty: 1,
      place_name: 'Парк Липки',
    },
    {
      id: 2,
      title: 'Культурный вечер',
      description: 'Посетите концерт в консерватории',
      category: 'culture',
      points_reward: 50,
      difficulty: 2,
      place_name: 'Саратовская консерватория',
    },
    {
      id: 3,
      title: 'Волжские виды',
      description: 'Прогуляйтесь по набережной и насладитесь видом на Волгу',
      category: 'nature',
      points_reward: 30,
      difficulty: 1,
      place_name: 'Набережная Космонавтов',
    },
  ];

  const completedQuests = [
    {
      id: 4,
      title: 'Первые шаги',
      points_earned: 10,
      completed_at: '2024-01-15',
    },
  ];

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'primary';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Легкий';
      case 2: return 'Средний';
      case 3: return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'walk': return '🚶';
      case 'culture': return '🎭';
      case 'nature': return '🌿';
      case 'food': return '🍽️';
      case 'history': return '🏛️';
      default: return '📍';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Квесты и задания
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Выполняйте интересные задания, исследуйте город и зарабатывайте баллы
        </Typography>

        {/* Статистика */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrophyIcon sx={{ fontSize: 48, color: 'gold', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {completedQuests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Выполнено квестов
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {completedQuests.reduce((sum, quest) => sum + quest.points_earned, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Заработано баллов
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocationIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {availableQuests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Доступно квестов
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Доступные квесты */}
        <Typography variant="h5" component="h2" gutterBottom>
          Доступные квесты
        </Typography>
        
        {availableQuests.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {availableQuests.map((quest) => (
              <Box sx={{ flex: '1 1 300px' }} key={quest.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {getCategoryIcon(quest.category)} {quest.title}
                      </Typography>
                      <Chip
                        label={getDifficultyText(quest.difficulty)}
                        color={getDifficultyColor(quest.difficulty) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {quest.description}
                    </Typography>
                    
                    {quest.place_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {quest.place_name}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Chip
                        label={`+${quest.points_reward} баллов`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Button variant="contained" size="small">
                        Начать квест
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            Нет доступных квестов. Попробуйте позже!
          </Alert>
        )}

        {/* Выполненные квесты */}
        <Typography variant="h5" component="h2" gutterBottom>
          Выполненные квесты
        </Typography>
        
        {completedQuests.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} >
            {completedQuests.map((quest) => (
              <Box sx={{ flex: '1 1 300px' }} key={quest.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          ✅ {quest.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Выполнено: {new Date(quest.completed_at).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`+${quest.points_earned} баллов`}
                        color="success"
                        variant="filled"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            Вы еще не выполнили ни одного квеста. Начните с доступных заданий выше!
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default QuestsPage;

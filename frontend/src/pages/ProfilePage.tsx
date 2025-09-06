import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  RateReview as ReviewIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Мок данные для достижений
  const achievements = [
    { id: 1, name: 'Первые шаги', icon: '🎯', earned: true },
    { id: 2, name: 'Исследователь', icon: '🗺️', earned: true },
    { id: 3, name: 'Гурман', icon: '🍽️', earned: false },
    { id: 4, name: 'Знаток Саратова', icon: '🏆', earned: false },
  ];

  // Мок данные для активности
  const recentActivity = [
    {
      type: 'quest_completed',
      title: 'Прогулка по Липкам',
      date: '2024-01-15',
      points: 20,
    },
    {
      type: 'review_added',
      title: 'Саратовская консерватория',
      date: '2024-01-14',
      rating: 5,
    },
    {
      type: 'achievement_earned',
      title: 'Исследователь',
      date: '2024-01-13',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quest_completed': return <TrophyIcon color="success" />;
      case 'review_added': return <ReviewIcon color="primary" />;
      case 'achievement_earned': return <StarIcon color="warning" />;
      default: return <LocationIcon />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'quest_completed':
        return `Выполнен квест "${activity.title}" (+${activity.points} баллов)`;
      case 'review_added':
        return `Добавлен отзыв о "${activity.title}" (${activity.rating} звезд)`;
      case 'achievement_earned':
        return `Получено достижение "${activity.title}"`;
      default:
        return activity.title;
    }
  };

  const nextLevelPoints = (user.level + 1) * 100;
  const currentLevelPoints = user.level * 100;
  const progressToNextLevel = ((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Профиль пользователя
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} >
          {/* Основная информация */}
          <Box sx={{ flex: '1 1 300px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user.avatar_url}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" gutterBottom>
                  {user.full_name || user.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  @{user.username}
                </Typography>

                {user.is_premium && (
                  <Chip
                    icon={<PremiumIcon />}
                    label="Premium"
                    color="warning"
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h3" color="primary.main">
                    {user.points}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    баллов
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" color="secondary.main">
                    Уровень {user.level}
                  </Typography>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progressToNextLevel, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    До уровня {user.level + 1}: {nextLevelPoints - user.points} баллов
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => {/* открыть настройки профиля */}}
                >
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Статистика
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Квестов выполнено:</Typography>
                  <Typography variant="body2" fontWeight="bold">1</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Отзывов написано:</Typography>
                  <Typography variant="body2" fontWeight="bold">1</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Достижений получено:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {achievements.filter(a => a.earned).length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Категорий изучено:</Typography>
                  <Typography variant="body2" fontWeight="bold">2</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Достижения и активность */}
          <Box sx={{ flex: '1 1 300px' }}>
            {/* Достижения */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Достижения
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} >
                  {achievements.map((achievement) => (
                    <Box sx={{ flex: '1 1 300px' }} key={achievement.id}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: achievement.earned ? 'success.light' : 'grey.100',
                          opacity: achievement.earned ? 1 : 0.5,
                          border: achievement.earned ? '2px solid' : '1px solid',
                          borderColor: achievement.earned ? 'success.main' : 'grey.300',
                        }}
                      >
                        <Typography variant="h4" component="div">
                          {achievement.icon}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {achievement.name}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {/* показать все достижения */}}
                >
                  Посмотреть все достижения
                </Button>
              </CardContent>
            </Card>

            {/* Последняя активность */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Последняя активность
                </Typography>
                
                <List>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={getActivityText(activity)}
                          secondary={new Date(activity.date).toLocaleDateString('ru-RU')}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {/* показать всю активность */}}
                >
                  Показать всю активность
                </Button>
              </CardContent>
            </Card>

            {/* Premium подписка */}
            {!user.is_premium && (
              <Card sx={{ mt: 3, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PremiumIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Получите Premium доступ
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    • Безлимитные квесты
                    • Персональные рекомендации ИИ
                    • Без рекламы
                    • Эксклюзивные скидки
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {/* открыть страницу подписки */}}
                  >
                    Оформить за 299₽/месяц
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;

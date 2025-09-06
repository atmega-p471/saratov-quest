import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
} from '@mui/material';
import SaratovCoatOfArms from '../components/Common/SaratovCoatOfArms';
import {
  Map as MapIcon,
  Quiz as QuestIcon,
  SmartToy as AIIcon,
  EmojiEvents as TrophyIcon,
  Restaurant as RestaurantIcon,
  Museum as MuseumIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <MapIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      title: 'Интерактивная карта',
      description: 'Исследуйте Саратов с помощью интерактивной карты с отмеченными интересными местами',
      action: 'Открыть карту',
      path: '/map',
      color: 'primary',
    },
    {
      icon: <QuestIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />,
      title: 'Квесты и задания',
      description: 'Выполняйте увлекательные квесты, зарабатывайте баллы и открывайте новые места',
      action: 'Смотреть квесты',
      path: '/quests',
      color: 'success',
      requireAuth: true,
    },
    {
      icon: <AIIcon sx={{ fontSize: 48, color: theme.palette.warning.main }} />,
      title: 'ИИ-помощник Волга',
      description: 'Персональный ассистент поможет составить маршрут и даст рекомендации',
      action: 'Чат с Волгой',
      path: '/ai-assistant',
      color: 'warning',
      requireAuth: true,
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 48, color: theme.palette.error.main }} />,
      title: 'Достижения',
      description: 'Собирайте достижения, соревнуйтесь с друзьями и становитесь экспертом Саратова',
      action: 'Мой профиль',
      path: '/profile',
      color: 'error',
      requireAuth: true,
    },
  ];

  const categories = [
    { name: 'Рестораны', icon: <RestaurantIcon />, count: '150+' },
    { name: 'Музеи', icon: <MuseumIcon />, count: '25+' },
    { name: 'Парки', icon: '🌳', count: '40+' },
    { name: 'Шоппинг', icon: '🛍️', count: '120+' },
    { name: 'Культура', icon: '🎭', count: '60+' },
    { name: 'Достопримечательности', icon: '🏰', count: '80+' },
  ];

  const handleFeatureClick = (feature: any) => {
    if (feature.requireAuth && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(feature.path);
    }
  };

  return (
    <Box>
      {/* Hero секция */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, rgba(44, 62, 80, 0.8) 0%, rgba(52, 152, 219, 0.8) 100%),
            url('/images/saratov-bridge.jpg') center/cover no-repeat,
            url('/images/bridge-placeholder.svg') center/cover no-repeat
          `,
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          },
          '& > *': {
            position: 'relative',
            zIndex: 2,
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ 
                color: 'white', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)' 
              }}>
                Добро пожаловать в
                <br />
                <Box component="span" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)' 
                }}>
                  Саратов Квест
                </Box>
              </Typography>
              <Typography variant="h6" paragraph sx={{ 
                color: 'white', 
                opacity: 0.95,
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)' 
              }}>
                Исследуйте город через увлекательные квесты, 
                зарабатывайте баллы и открывайте для себя лучшие места Саратова
              </Typography>
              {isAuthenticated ? (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: 'white',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)' 
                  }}>
                    Добро пожаловать, {user?.username}! 👋
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Chip
                      label={`Уровень ${user?.level}`}
                      color="warning"
                      variant="filled"
                    />
                    <Chip
                      label={`${user?.points} баллов`}
                      color="success"
                      variant="filled"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/quests')}
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.grey[100],
                      },
                    }}
                  >
                    Продолжить квесты
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.grey[100],
                      },
                    }}
                  >
                    Начать приключение
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/map')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Посмотреть карту
                  </Button>
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SaratovCoatOfArms 
                  width={{ xs: 120, md: 200 }}
                  height={{ xs: 120, md: 200 }}
                  sx={{
                    opacity: 0.9,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Основные функции */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Возможности приложения
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
            Откройте для себя Саратов с помощью современных технологий
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 4 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                    {feature.requireAuth && !isAuthenticated && (
                      <Chip
                        label="Требуется регистрация"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      variant="contained"
                      color={feature.color as any}
                      onClick={() => handleFeatureClick(feature)}
                    >
                      {feature.action}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Категории мест */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Категории мест
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
            Более 500 интересных мест в разных категориях
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4 }}>
            {categories.map((category, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 45%', sm: '1 1 30%', md: '1 1 15%' } }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate(`/map?category=${category.name.toLowerCase()}`)}
                >
                  <Box sx={{ fontSize: '2rem', mb: 1 }}>
                    {typeof category.icon === 'string' ? category.icon : category.icon}
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.count}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Призыв к действию */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Готовы начать исследование?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Присоединяйтесь к тысячам пользователей, которые уже открывают Саратов заново
          </Typography>
          {!isAuthenticated && (
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Зарегистрироваться бесплатно
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

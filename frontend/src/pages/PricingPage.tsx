import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Check as CheckIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const userPlans = [
    {
      id: 'free',
      name: 'Бесплатный',
      price: 0,
      yearlyPrice: 0,
      description: 'Базовые возможности для знакомства с городом',
      features: [
        'Базовая карта и информация о местах',
        '3 квеста в месяц',
        'Базовые рекомендации ИИ',
        'Возможность оставлять отзывы',
        'Система баллов и уровней',
      ],
      limitations: [
        'Реклама в интерфейсе',
        'Ограниченный доступ к квестам',
        'Базовые функции ИИ',
      ],
      buttonText: 'Текущий план',
      buttonColor: 'primary',
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299,
      yearlyPrice: 1999,
      description: 'Полный доступ ко всем возможностям приложения',
      features: [
        'Безлимитные квесты',
        'Персональные рекомендации ИИ',
        'Без рекламы',
        'Эксклюзивные скидки 10-20%',
        'Приоритетная поддержка',
        'Доступ к закрытым событиям',
        'Расширенная статистика',
      ],
      buttonText: 'Оформить Premium',
      buttonColor: 'secondary',
      popular: true,
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 1999,
      yearlyPrice: 15999,
      description: 'Максимум привилегий и персональный сервис',
      features: [
        'Все функции Premium',
        'Кэшбэк 5% с покупок',
        'Персональные предложения',
        'Бесплатные экскурсии (1 раз в месяц)',
        'VIP-линия поддержки',
        'Персональный менеджер',
        'Ранний доступ к новым функциям',
      ],
      buttonText: 'Оформить VIP',
      buttonColor: 'warning',
      popular: false,
    },
  ];

  const businessPlans = [
    {
      id: 'basic',
      name: 'Базовый',
      price: 5000,
      description: 'Для небольших заведений',
      features: [
        'Размещение на карте',
        'Базовая информация о заведении',
        'Отзывы клиентов',
        'Статистика просмотров',
        'Поддержка по email',
      ],
      buttonText: 'Выбрать план',
      buttonColor: 'primary',
    },
    {
      id: 'advanced',
      name: 'Продвинутый',
      price: 15000,
      description: 'Для активного продвижения',
      features: [
        'Все функции Базового плана',
        'Приоритетное размещение в поиске',
        'Создание собственных квестов',
        'Push-уведомления клиентам поблизости',
        'Детальная аналитика посещений',
        'Возможность создавать акции',
        'Телефонная поддержка',
      ],
      buttonText: 'Выбрать план',
      buttonColor: 'secondary',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 30000,
      description: 'Максимальная видимость',
      features: [
        'Все функции Продвинутого плана',
        'Топ-позиции в рекомендациях ИИ',
        'Спонсорские квесты с призами',
        'Интеграция с системой лояльности',
        'Персональный менеджер',
        'Рекламные баннеры в приложении',
        'Приоритетная техподдержка 24/7',
      ],
      buttonText: 'Выбрать план',
      buttonColor: 'warning',
    },
  ];

  const handlePlanSelect = (planId: string, isBusinessPlan: boolean = false) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // В реальном приложении здесь была бы интеграция с платежной системой
    alert(`Выбран план: ${planId}. Интеграция с платежной системой будет добавлена в следующей версии.`);
  };

  const getDiscountPercentage = () => {
    return Math.round((1 - (1999 / (299 * 12))) * 100);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Выберите ваш план
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Откройте для себя все возможности Саратов Квест
          </Typography>
        </Box>

        {/* Планы для пользователей */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h4" component="h2">
              Для пользователей
            </Typography>
          </Box>

          {/* Переключатель месяц/год */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isYearly}
                  onChange={(e) => setIsYearly(e.target.checked)}
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Годовая подписка</Typography>
                  {isYearly && (
                    <Chip
                      label={`-${getDiscountPercentage()}%`}
                      color="success"
                      size="small"
                    />
                  )}
                </Box>
              }
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} >
            {userPlans.map((plan) => (
              <Box sx={{ flex: '1 1 300px' }} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.popular ? 2 : 1,
                    borderColor: plan.popular ? 'secondary.main' : 'divider',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Популярный"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {plan.price === 0 ? (
                        <Typography variant="h3" component="div">
                          Бесплатно
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="h3" component="div">
                            {isYearly ? plan.yearlyPrice : plan.price}₽
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isYearly ? 'в год' : 'в месяц'}
                          </Typography>
                          {isYearly && plan.price > 0 && (
                            <Typography variant="caption" color="success.main">
                              Экономия {(plan.price * 12) - plan.yearlyPrice}₽ в год
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description}
                    </Typography>

                    <List dense>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {plan.limitations && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ограничения:
                        </Typography>
                        {plan.limitations.map((limitation, index) => (
                          <Typography
                            key={index}
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            • {limitation}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={plan.buttonColor as any}
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={plan.id === 'free' && !user?.is_premium}
                    >
                      {plan.id === 'free' && !user?.is_premium ? 'Текущий план' : plan.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Планы для бизнеса */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <BusinessIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h4" component="h2">
              Для бизнеса
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Специальное предложение:</strong> Первый месяц бесплатно для новых клиентов! 
              Все тарифы включают комиссию 3-5% с продаж через приложение.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }} >
            {businessPlans.map((plan) => (
              <Box sx={{ flex: '1 1 300px' }} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.popular ? 2 : 1,
                    borderColor: plan.popular ? 'secondary.main' : 'divider',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Рекомендуем"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" component="div">
                        {plan.price.toLocaleString('ru-RU')}₽
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        в месяц
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description}
                    </Typography>

                    <List dense>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={plan.buttonColor as any}
                      onClick={() => handlePlanSelect(plan.id, true)}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Нужен индивидуальный план? Свяжитесь с нами: business@saratov-quest.ru
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PricingPage;

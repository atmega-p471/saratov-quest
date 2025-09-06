import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Приветственное сообщение
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      text: `Привет, ${user?.username}! Я Волга, ваш виртуальный помощник по Саратову! 🏛️\n\nГотов помочь вам:\n• Найти интересные места\n• Составить маршрут\n• Дать рекомендации по бюджету\n• Рассказать о достопримечательностях\n\nО чем хотите узнать?`,
      timestamp: new Date(),
      suggestions: [
        'Где поесть в Саратове?',
        'Что посмотреть в городе?',
        'Составь маршрут на день',
        'Посоветуй недорогие места',
      ],
    };
    setMessages([welcomeMessage]);
  }, [user?.username]);

  const sendMessage = async (messageText: string) => {
    console.log('sendMessage вызван с текстом:', JSON.stringify(messageText));

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Отправляем запрос к реальному AI API
      const token = localStorage.getItem('token');
      console.log('Отправляем сообщение:', messageText);
      console.log('Токен:', token ? 'есть' : 'отсутствует');
      
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        console.error('Ошибка ответа:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Текст ошибки:', errorText);
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      // Fallback к локальной функции в случае ошибки
      const aiResponse = generateAIResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: aiResponse.text,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    console.log('handleSendMessage вызван, inputValue:', JSON.stringify(inputValue));
    
    if (!inputValue.trim()) {
      console.log('inputValue пустой, выходим');
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    await sendMessage(messageText);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    console.log('Клик по suggestion:', suggestion);
    await sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateAIResponse = (userInput: string): { text: string; suggestions: string[] } => {
    const input = userInput.toLowerCase();

    if (input.includes('ресторан') || input.includes('поесть') || input.includes('еда')) {
      return {
        text: 'В Саратове много отличных ресторанов! 🍽️\n\nРекомендую:\n• "Волжский берег" - местная кухня с видом на Волгу\n• "Гастроном" - современная европейская кухня\n• "Саратовская рыбалка" - лучшая волжская стерлядь\n\nКакую кухню предпочитаете и какой у вас бюджет?',
        suggestions: ['Недорогие кафе', 'Рестораны с видом', 'Местная кухня', 'Быстрая еда'],
      };
    }

    if (input.includes('достопримечательност') || input.includes('посмотреть') || input.includes('музей')) {
      return {
        text: 'В Саратове много интересных мест! 🏛️\n\nОбязательно посетите:\n• Парк Липки - старейший парк города\n• Саратовская консерватория им. Собинова\n• Набережная Космонавтов с видом на Волгу\n• Радищевский музей\n• Смотровая площадка на Соколовой горе\n\nЧто вас больше интересует - история, культура или природа?',
        suggestions: ['Исторические места', 'Музеи города', 'Парки и природа', 'Архитектура'],
      };
    }

    if (input.includes('маршрут') || input.includes('план')) {
      return {
        text: 'Отлично! Составлю для вас маршрут по Саратову 🗺️\n\nДля начала скажите:\n• На сколько часов планируете прогулку?\n• Что вас интересует больше всего?\n• Предпочитаете пешие прогулки или с транспортом?\n• Какой у вас бюджет?\n\nНа основе ваших ответов я составлю оптимальный маршрут!',
        suggestions: ['Маршрут на полдня', 'Культурная программа', 'Активный отдых', 'Романтическая прогулка'],
      };
    }

    if (input.includes('дешево') || input.includes('бюджет') || input.includes('недорог')) {
      return {
        text: 'Понимаю! В Саратове можно отлично провести время с любым бюджетом 💰\n\nБесплатно:\n• Прогулки по центру города\n• Парк Липки\n• Набережная Космонавтов\n• Архитектурные памятники\n\nДешево (до 500₽):\n• Кафе "Блинная"\n• Музеи со льготами\n• Речной трамвай\n\nСколько готовы потратить на день?',
        suggestions: ['Бесплатные места', 'До 1000 рублей', 'Студенческие льготы', 'Семейный бюджет'],
      };
    }

    // Общий ответ
    return {
      text: 'Интересный вопрос! 🤔\n\nСаратов - удивительный город с богатой историей. Здесь каждый найдет что-то по душе: от исторических памятников до современных развлечений.\n\nМогу рассказать о:\n• Лучших местах для посещения\n• Ресторанах и кафе\n• Культурных мероприятиях\n• Составлении маршрутов\n\nО чем именно хотите узнать?',
      suggestions: ['Рестораны', 'Достопримечательности', 'События сегодня', 'Маршрут выходного дня'],
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ИИ-помощник Волга
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Персональный ассистент для исследования Саратова
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Чат */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
              {/* Сообщения */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message) => (
                  <Box key={message.id} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          maxWidth: '80%',
                          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mx: 1,
                            bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                          }}
                        >
                          {message.type === 'user' ? <PersonIcon /> : <AIIcon />}
                        </Avatar>
                        <Paper
                          className={message.type === 'user' ? 'user-message-light-blue' : ''}
                          sx={{
                            p: 2,
                            bgcolor: message.type === 'user' ? undefined : '#ffffff', // белый фон только для AI
                            color: message.type === 'user' ? undefined : '#000000', // цвет для AI, для user берется из CSS класса
                            border: message.type === 'user' ? undefined : '1px solid #e0e0e0', // рамка для AI, для user из CSS класса
                          }}
                        >
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {message.text}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              mt: 1, 
                              display: 'block',
                              color: '#666666' // одинаковый серый цвет для времени
                            }}
                          >
                            {message.timestamp.toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                    
                    {/* Предложения */}
                    {message.suggestions && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            variant="outlined"
                            size="small"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
                
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                      <AIIcon />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: '#ffffff', color: '#000000', border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2">Волга думает...</Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Поле ввода */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Напишите ваш вопрос..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || loading}
                    sx={{ minWidth: 48 }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Информационная панель */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  О Волге
                </Typography>
                <Typography variant="body2" paragraph>
                  Волга - это ваш персональный ИИ-помощник, который знает все о Саратове. 
                  Она поможет вам найти лучшие места, составить маршрут и даст полезные советы.
                </Typography>
                <Typography variant="body2">
                  <strong>Возможности:</strong><br />
                  • Поиск мест по интересам<br />
                  • Составление маршрутов<br />
                  • Рекомендации по бюджету<br />
                  • Информация о событиях<br />
                  • Советы местного жителя
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Быстрые вопросы
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'Где поесть в центре?',
                    'Что посмотреть за день?',
                    'Куда сходить вечером?',
                    'Места для фотосессии',
                    'Активный отдых в городе',
                  ].map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      variant="outlined"
                      onClick={() => handleSuggestionClick(question)}
                      sx={{ cursor: 'pointer', justifyContent: 'flex-start' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default AIAssistantPage;

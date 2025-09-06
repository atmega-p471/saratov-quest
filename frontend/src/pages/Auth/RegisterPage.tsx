import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import SaratovCoatOfArms from '../../components/Common/SaratovCoatOfArms';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { RegisterForm } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Очищаем ошибку при изменении формы
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Валидация на клиенте
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Введите корректный email адрес');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      login(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.username.trim() && 
    formData.email.trim() && 
    formData.password.trim() &&
    formData.full_name.trim();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <SaratovCoatOfArms width={40} height={40} />
            Саратов Квест
          </Typography>
          <Typography component="h2" variant="h5" gutterBottom>
            Регистрация
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              helperText="Минимум 3 символа"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email адрес"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="full_name"
              label="Полное имя"
              name="full_name"
              autoComplete="name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              helperText="Минимум 6 символов"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войдите
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Преимущества регистрации */}
        <Paper
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'rgba(39, 174, 96, 0.05)',
            border: '1px solid rgba(39, 174, 96, 0.1)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>После регистрации вы получите:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            • Доступ к квестам и заданиям
          </Typography>
          <Typography variant="caption" display="block">
            • Персональные рекомендации от ИИ Волга
          </Typography>
          <Typography variant="caption" display="block">
            • Систему баллов и достижений
          </Typography>
          <Typography variant="caption" display="block">
            • Возможность оставлять отзывы
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;

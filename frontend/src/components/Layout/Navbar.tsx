import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SaratovCoatOfArms from '../Common/SaratovCoatOfArms';
import {
  Menu as MenuIcon,
  AccountCircle,
  Map as MapIcon,
  Quiz as QuestIcon,
  SmartToy as AIIcon,
  Home as HomeIcon,
  ExitToApp as LogoutIcon,
  WorkspacePremium,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const navigationItems = [
    { label: 'Главная', path: '/', icon: <HomeIcon /> },
    { label: 'Карта', path: '/map', icon: <MapIcon /> },
    { label: 'Тарифы', path: '/pricing', icon: <WorkspacePremium /> },
    ...(isAuthenticated ? [
      { label: 'Квесты', path: '/quests', icon: <QuestIcon /> },
      { label: 'ИИ Волга', path: '/ai-assistant', icon: <AIIcon /> },
    ] : []),
  ];

  const isActivePage = (path: string) => location.pathname === path;

  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          onClick={() => navigate(item.path)}
          startIcon={item.icon}
          sx={{
            backgroundColor: isActivePage(item.path) ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
            color: isActivePage(item.path) ? theme.palette.secondary.main : 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
      keepMounted
    >
      {navigationItems.map((item) => (
        <MenuItem
          key={item.path}
          onClick={() => {
            navigate(item.path);
            handleMenuClose();
          }}
          selected={isActivePage(item.path)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.icon}
            {item.label}
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );

  const renderProfileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      keepMounted
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
        <AccountCircle sx={{ mr: 1 }} />
        Профиль
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Выйти
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Мобильное меню */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleMobileMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Логотип */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            cursor: 'pointer',
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={() => navigate('/')}
        >
          <SaratovCoatOfArms width={28} height={28} />
          Саратов Квест
        </Typography>

        {/* Десктопная навигация */}
        {!isMobile && renderDesktopMenu()}

        {/* Правая часть - аутентификация */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              {/* Статистика пользователя */}
              {!isMobile ? (
                // Десктопная версия
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                  {/* Уровень */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      LVL
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.warning.main,
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {user?.level || 1}
                    </Typography>
                  </Box>

                  {/* Разделитель */}
                  <Box sx={{ width: '1px', height: '16px', bgcolor: 'divider' }} />

                  {/* Баллы */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                      ⭐
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.success.main,
                        minWidth: '30px',
                      }}
                    >
                      {user?.points || 0}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Мобильная версия - компактное отображение
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: theme.palette.warning.main,
                      color: 'white',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '12px', // +2px
                    }}
                  >
                    L{user?.level || 1}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '12px', // +2px
                    }}
                  >
                    {user?.points || 0}★
                  </Typography>
                </Box>
              )}

              {/* Профиль */}
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.avatar_url ? (
                  <Avatar src={user.avatar_url} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                variant={location.pathname === '/login' ? 'outlined' : 'text'}
              >
                Войти
              </Button>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ color: 'white' }}
              >
                Регистрация
              </Button>
            </Box>
          )}
        </Box>

        {/* Меню профиля */}
        {isAuthenticated && renderProfileMenu()}

        {/* Мобильное меню */}
        {isMobile && renderMobileMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

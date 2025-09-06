import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';

// Компоненты
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import QuestsPage from './pages/QuestsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PlacePage from './pages/PlacePage';
import AIAssistantPage from './pages/AIAssistantPage';
import PricingPage from './pages/PricingPage';

// Контекст аутентификации
import { AuthProvider } from './contexts/AuthContext';

// Защищенные маршруты
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/places/:id" element={<PlacePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              
              {/* Защищенные маршруты */}
              <Route 
                path="/quests" 
                element={
                  <ProtectedRoute>
                    <QuestsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant" 
                element={<AIAssistantPage />}
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

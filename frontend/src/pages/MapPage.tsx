import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '../types';

// Исправляем проблему с иконками Leaflet в React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage: React.FC = () => {
  const theme = useTheme();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Координаты центра Саратова
  const saratovCenter: [number, number] = [51.533562, 46.034266];

  const categories = [
    { id: 'all', name: 'Все', color: 'primary' },
    { id: 'cafe', name: 'Кафе', color: 'beige' },
    { id: 'shopping', name: 'Шоппинг', color: 'pink' },
    { id: 'museum', name: 'Музеи', color: 'lightblue' },
    { id: 'attraction', name: 'Достопримечательности', color: 'red' },
    { id: 'park', name: 'Парки', color: 'green' },
    { id: 'culture', name: 'Культура', color: 'error' },
  ];

  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      // В реальном приложении здесь был бы запрос к API
      // const response = await apiService.get('/places', { params: { category: selectedCategory } });
      
      // Для демо используем статичные данные
      const mockPlaces: Place[] = [
        // Кафе (объединены рестораны и кафе)
        {
          id: 1,
          name: 'Кофейня "Волжская"',
          description: 'Уютная кофейня с видом на Волгу и домашней выпечкой',
          category: 'cafe',
          latitude: 51.533562,
          longitude: 46.034266,
          address: 'ул. Волжская, 12, Саратов',
          rating: 4.7,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 2,
          name: 'Ресторан "Саратовский"',
          description: 'Традиционная русская кухня в центре города',
          category: 'cafe',
          latitude: 51.531000,
          longitude: 46.028000,
          address: 'пр. Кирова, 25, Саратов',
          rating: 4.5,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 3,
          name: 'Кафе "Липки"',
          description: 'Семейное кафе рядом с парком Липки',
          category: 'cafe',
          latitude: 51.535000,
          longitude: 46.032000,
          address: 'ул. Радищева, 45, Саратов',
          rating: 4.3,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        
        // Шоппинг
        {
          id: 4,
          name: 'ТЦ "Триумф Молл"',
          description: 'Крупный торговый центр с множеством магазинов и развлечений',
          category: 'shopping',
          latitude: 51.540000,
          longitude: 46.040000,
          address: 'ул. Чернышевского, 181, Саратов',
          rating: 4.4,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 5,
          name: 'ТРК "Сити Молл"',
          description: 'Современный торгово-развлекательный комплекс',
          category: 'shopping',
          latitude: 51.525000,
          longitude: 46.045000,
          address: 'ул. Вольская, 97, Саратов',
          rating: 4.2,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 6,
          name: 'Торговый дом "Кировский"',
          description: 'Центральный торговый дом с местными товарами',
          category: 'shopping',
          latitude: 51.530000,
          longitude: 46.025000,
          address: 'пр. Кирова, 15, Саратов',
          rating: 4.0,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },

        // Музеи
        {
          id: 7,
          name: 'Радищевский музей',
          description: 'Старейший художественный музей России в провинции',
          category: 'museum',
          latitude: 51.533333,
          longitude: 46.008889,
          address: 'ул. Радищева, 39, Саратов',
          rating: 4.8,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 8,
          name: 'Музей К.А. Федина',
          description: 'Литературный музей, посвященный известному писателю',
          category: 'museum',
          latitude: 51.532000,
          longitude: 46.012000,
          address: 'ул. Чернышевского, 154, Саратов',
          rating: 4.6,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 9,
          name: 'Музей боевой славы',
          description: 'Музей, посвященный военной истории Саратова',
          category: 'museum',
          latitude: 51.528000,
          longitude: 46.015000,
          address: 'ул. Соборная, 34, Саратов',
          rating: 4.5,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },

        // Достопримечательности
        {
          id: 10,
          name: 'Набережная Космонавтов',
          description: 'Живописная набережная Волги с прекрасными видами',
          category: 'attraction',
          latitude: 51.520833,
          longitude: 46.030556,
          address: 'Набережная Космонавтов, Саратов',
          rating: 4.6,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 11,
          name: 'Соколовая гора',
          description: 'Высочайшая точка Саратова с обзорной площадкой',
          category: 'attraction',
          latitude: 51.565000,
          longitude: 46.055000,
          address: 'Соколовая гора, Саратов',
          rating: 4.7,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 12,
          name: 'Мост Саратов-Энгельс',
          description: 'Знаменитый мост через Волгу, символ города',
          category: 'attraction',
          latitude: 51.515000,
          longitude: 46.050000,
          address: 'Мост Саратов-Энгельс',
          rating: 4.8,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },

        // Парки
        {
          id: 13,
          name: 'Парк Липки',
          description: 'Старейший парк Саратова с красивыми аллеями',
          category: 'park',
          latitude: 51.533562,
          longitude: 46.034266,
          address: 'ул. Радищева, Саратов',
          rating: 4.5,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 14,
          name: 'Городской парк',
          description: 'Центральный парк культуры и отдыха',
          category: 'park',
          latitude: 51.528000,
          longitude: 46.038000,
          address: 'ул. Чапаева, Саратов',
          rating: 4.3,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 15,
          name: 'Парк Победы',
          description: 'Мемориальный парк с памятниками и аллеями',
          category: 'park',
          latitude: 51.545000,
          longitude: 46.042000,
          address: 'ул. Политехническая, Саратов',
          rating: 4.4,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },

        // Культура
        {
          id: 16,
          name: 'Саратовская консерватория',
          description: 'Знаменитая консерватория имени Л.В. Собинова',
          category: 'culture',
          latitude: 51.533333,
          longitude: 46.008889,
          address: 'пр. Кирова, 1, Саратов',
          rating: 4.8,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 17,
          name: 'Театр оперы и балета',
          description: 'Саратовский академический театр оперы и балета',
          category: 'culture',
          latitude: 51.530000,
          longitude: 46.010000,
          address: 'пл. Театральная, 1, Саратов',
          rating: 4.7,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 18,
          name: 'Драматический театр',
          description: 'Саратовский академический театр драмы им. И.А. Слонова',
          category: 'culture',
          latitude: 51.535000,
          longitude: 46.013000,
          address: 'ул. Волжская, 1, Саратов',
          rating: 4.6,
          is_premium: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      // Фильтруем по категории если выбрана
      const filteredPlaces = selectedCategory && selectedCategory !== 'all' 
        ? mockPlaces.filter(place => place.category === selectedCategory)
        : mockPlaces;

      setPlaces(filteredPlaces);
    } catch (err: any) {
      setError('Ошибка загрузки мест');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, fetchPlaces]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      restaurant: '🍽️',
      cafe: '🍽️',
      park: '🌳',
      museum: '🏛️',
      culture: '🎭',
      attraction: '🏰',
      shopping: '🛍️',
      entertainment: '🎮',
      sport: '⚽',
      hotel: '🏨',
    };
    return icons[category] || '📍';
  };

  const getCategoryColor = (colorName: string) => {
    const colors: { [key: string]: string } = {
      'beige': '#F5F5DC',
      'pink': '#FFB6C1', 
      'lightblue': '#87CEEB',
      'red': '#FF6B6B',
      'green': '#98D8C8',
    };
    return colors[colorName] || theme.palette.primary.main;
  };

  const getCategoryBorderColor = (colorName: string) => {
    const borderColors: { [key: string]: string } = {
      'beige': '#DEB887',
      'pink': '#FF69B4', 
      'lightblue': '#4682B4',
      'red': '#DC143C',
      'green': '#66CDAA',
    };
    return borderColors[colorName] || theme.palette.primary.dark;
  };

  const createCustomIcon = (category: string) => {
    const categoryInfo = categories.find(cat => cat.id === category);
    const color = categoryInfo ? getCategoryBorderColor(categoryInfo.color) : '#2C3E50';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Карта Саратова
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Исследуйте интересные места города на интерактивной карте
        </Typography>

        {/* Фильтры по категориям */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Категории:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.id === 'all' ? category.name : `${getCategoryIcon(category.id)} ${category.name}`}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                clickable
                sx={{ 
                  backgroundColor: selectedCategory === category.id 
                    ? getCategoryColor(category.color) 
                    : 'transparent',
                  borderColor: getCategoryBorderColor(category.color),
                  color: selectedCategory === category.id 
                    ? '#000000' 
                    : getCategoryBorderColor(category.color),
                  '&:hover': {
                    backgroundColor: getCategoryColor(category.color),
                    opacity: 0.8,
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Карта */}
          <Box sx={{ flex: 2 }}>
            <Card>
              <Box sx={{ height: 500 }}>
                <MapContainer
                  center={saratovCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {places.map((place) => (
                    <Marker
                      key={place.id}
                      position={[place.latitude, place.longitude]}
                      icon={createCustomIcon(place.category)}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Typography variant="h6" gutterBottom>
                            {place.name}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {place.description}
                          </Typography>
                          <Typography variant="caption" display="block">
                            📍 {place.address}
                          </Typography>
                          <Typography variant="caption" display="block">
                            ⭐ {place.rating}/5
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{ mt: 1 }}
                            onClick={() => {/* navigate to place details */}}
                          >
                            Подробнее
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Card>
          </Box>

          {/* Список мест */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Найденные места ({places.length})
            </Typography>
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {places.map((place) => (
                <Card key={place.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {place.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {place.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={place.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption">
                        ⭐ {place.rating}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      📍 {place.address}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default MapPage;

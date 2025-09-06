// Типы для пользователя
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  points: number;
  level: number;
  is_premium: boolean;
  avatar_url?: string;
  created_at?: string;
  stats?: UserStats;
}

export interface UserStats {
  quests_completed: number;
  categories_explored: number;
  reviews_written: number;
  achievements_earned: number;
}

// Типы для мест
export interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  image_url?: string;
  is_premium: boolean;
  owner_id?: number;
  created_at: string;
  updated_at: string;
  reviews?: Review[];
}


// Типы для квестов
export interface Quest {
  id: number;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  difficulty: number;
  place_id?: number;
  place_name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  place_image?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserQuest {
  id: number;
  user_id: number;
  quest_id: number;
  completed_at: string;
  points_earned: number;
  quest?: Quest;
}

export interface QuestStats {
  total_completed: number;
  total_points: number;
  easy_completed: number;
  medium_completed: number;
  hard_completed: number;
  expert_completed: number;
}

// Типы для отзывов
export interface Review {
  id: number;
  user_id: number;
  place_id: number;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

// Типы для достижений
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  created_at: string;
  earned_at?: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  achievement?: Achievement;
}

// Типы для ИИ-ассистента
export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  suggestions?: string[];
}

export interface AIRecommendations {
  places: Place[];
  quests: Quest[];
  message: string;
  user_preferences: UserPreference[];
}

export interface UserPreference {
  category: string;
  frequency: number;
  avg_points: number;
}

// Типы для маршрутов
export interface RoutePlace extends Place {
  order: number;
  estimated_time: number;
}

export interface Route {
  places: RoutePlace[];
  estimated_duration: number;
  total_distance: number;
  description: string;
}

// Типы для подписок
export interface Subscription {
  id: number;
  user_id: number;
  plan_type: 'basic' | 'advanced' | 'premium' | 'monthly' | 'yearly';
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Типы для активности пользователя
export interface UserActivity {
  type: 'quest_completed' | 'review_added' | 'achievement_earned';
  title: string;
  points?: number;
  rating?: number;
  date: string;
  place_name?: string;
}

// Типы для рейтинга
export interface LeaderboardEntry {
  id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  level: number;
  quests_completed: number;
  position: number;
}

// Типы для форм
export interface LoginForm {
  login: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface PlaceForm {
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  image_url?: string;
}

export interface QuestForm {
  title: string;
  description: string;
  category: string;
  points_reward: number;
  difficulty: number;
  place_id?: number;
}

export interface ReviewForm {
  rating: number;
  comment: string;
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  errors?: ValidationError[];
  data?: T;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Типы для аутентификации
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// Типы для карты
export interface MapMarker {
  id: number;
  position: [number, number];
  title: string;
  category: string;
  rating?: number;
  completed?: boolean;
}

export interface MapFilters {
  categories: string[];
  rating: number;
  distance: number;
  showCompleted: boolean;
}

// Утилитарные типы
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  category?: string;
  difficulty?: number;
}

export interface FilterParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Константы для категорий квестов
export const QUEST_CATEGORIES = [
  'walk', 'culture', 'nature', 'food', 'history', 'photo', 'social'
] as const;

export type QuestCategory = typeof QUEST_CATEGORIES[number];

// Константы для сложности квестов
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// Константы для категорий мест
export const PLACE_CATEGORIES = [
  'restaurant', 'cafe', 'park', 'museum', 'culture', 'attraction', 
  'shopping', 'entertainment', 'sport', 'hotel'
] as const;

export type PlaceCategory = typeof PLACE_CATEGORIES[number];

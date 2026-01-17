// Database Types
export interface User {
  user_id: string;
  email: string;
  password?: string; // ไม่ส่งไปยัง client
  full_name: string;
  role: 's' | 't' | 'a'; // student, teacher, admin
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  category_name: string;
}

export interface Question {
  question_id: string;
  title: string;
  content: string;
  user_id: string;
  user?: User;
  view_count: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  comments?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

export interface Comment {
  comment_id: string;
  content: string;
  user_id: string;
  user?: User;
  question_id: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  is_liked?: boolean;
}

export interface Like {
  like_id: string;
  user_id: string;
  content_id: string;
  content_type: 'q' | 'c'; // question, comment
  created_at: string;
}

export interface Report {
  report_id: string;
  user_id: string;
  user?: User;
  reason: string;
  content_id: string;
  content_type: 'q' | 'c'; // question, comment
  description?: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionCategory {
  question_id: string;
  category_id: string;
}

// Auth Types
export interface LoginCredentials {
  user_id: string;
  password: string;
}

export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  role: 's' | 't' | 'a';
  created_at?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface CreateQuestionForm {
  title: string;
  content: string;
  category_ids: string[];
}

export interface CreateCommentForm {
  content: string;
  question_id: string;
}

export interface CreateReportForm {
  reason: string;
  description?: string;
  content_id: string;
  content_type: 'q' | 'c';
}

export interface CreateUserForm {
  email: string;
  password: string;
  full_name: string;
  role: 's' | 't' | 'a';
}

export interface UpdateUserForm {
  email?: string;
  full_name?: string;
  role?: 's' | 't' | 'a';
}

export interface ResetPasswordForm {
  email: string;
}

// Statistics Types
export interface Statistics {
  total_users: number;
  total_questions: number;
  total_comments: number;
  new_users_this_month: number;
  new_questions_this_month: number;
  active_users: number;
  resolved_reports: number;
  pending_reports: number;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  category_id?: string;
  user_id?: string;
  sort_by?: 'created_at' | 'view_count' | 'likes_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Language Types
export type Language = 'th' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  roles?: ('s' | 't' | 'a')[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
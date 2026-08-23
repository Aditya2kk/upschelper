export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
  path?: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  color?: string;
  sortOrder: number;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
  importance: 'HIGH' | 'NORMAL' | 'LOW';
  categories: Category[];
  upscRelevance?: string;
  gsPaper?: string;
}

export interface Newspaper {
  id: string;
  title: string;
  editionDate: string;
  language: string;
  sourceName: string;
  canRedistribute: boolean;
  pdfUrl?: string;
  thumbnailUrl?: string;
  pageCount?: number;
}

export interface UpscAnalysis {
  id: string;
  articleId: string;
  syllabusPaper: string;
  prelimsRelevance: string;
  mainsRelevance: string;
  keyFacts: string[];
  background: string;
  challenges: string;
  governmentInitiatives: string;
  wayForward: String;
  keywords: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  processingStatus: 'PENDING' | 'EXTRACTING' | 'CHUNKING' | 'EMBEDDING' | 'READY' | 'FAILED';
  pageCount?: number;
  fileSize: number;
  createdAt: string;
}

export interface SearchResult {
  articles: Article[];
  newspapers: Newspaper[];
  documents: DocumentItem[];
  totalResults: number;
}

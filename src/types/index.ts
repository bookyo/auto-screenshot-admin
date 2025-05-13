// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
}

// Media Types
export type MediaType = 'ANIME' | 'MANGA' | 'NOVEL';
export type MediaStatus = 'pending' | 'approved' | 'hidden';

export interface Translation {
  title: string;
  description: string;
}

export interface Episode {
  _id?: string;
  episode: string;
  screenshots: string[];
  video: string;
}

export interface Character {
  _id?: string;
  originalName: string;
  translations: Map<string, { name: string; description: string }>;
}

export interface Media {
  _id: string;
  mediaType: MediaType;
  translations: Map<string, Translation>;
  originalTitle: string;
  releaseDate: string;
  duration: number;
  episodes: number;
  year: number;
  episodesList: Episode[];
  characters: Character[];
  tags: string[];
  status: MediaStatus;
  isOngoing: boolean;
  averageRating: number;
  pv: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFilterParams {
  mediaType?: MediaType;
  status?: MediaStatus;
  isOngoing?: boolean;
  tags?: string[];
  sort?: string;
  limit?: number;
  page?: number;
}

// Maccms Types
export interface MaccmsSetting {
  url: string;
  open: boolean;
  geturl: string;
  delcategory: string;
  date: number;
  cron: number;
  ism3u8: boolean;
  cjnum: number;
}

export interface Maccms {
  _id: string;
  url: string;
  geturl: string;
  delcategory: string;
  open: boolean;
  ism3u8: boolean;
  date: number;
  cron: number;
  cjnum: number;
  meta: {
    createAt: string;
    updateAt: string;
  };
}

// Download Types
export interface Download {
  _id: string;
  name: string;
  url: string;
  geturl: string;
  getdownurl: string;
  poster: string;
  path: string;
  status: string;
  type: string;
  clientId: string;
  category: string;
  originaltitle: string;
  retrycount: number;
  aka: string;
  language: string;
  banben: string;
  director: string;
  stars: string;
  writer: string;
  summary: string;
  country: string;
  tvId: string;
  tvepisodes: string;
  tvepisodesname: string;
  tags: string;
  year: number;
  remark: string;
  resolution: string;
  rate: number;
  syncMarks: string[];
  startTime: string;
  createAt: string;
}

// Pagination
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

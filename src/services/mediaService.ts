import { Media, MediaFilterParams, Episode, PaginatedResponse } from '../types';
import { apiRequest } from './api';

export const getMediaList = async (params?: MediaFilterParams): Promise<PaginatedResponse<Media>> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.mediaType) queryParams.append('mediaType', params.mediaType);
    if (params.status) queryParams.append('status', params.status);
    if (params.isOngoing !== undefined) queryParams.append('isOngoing', String(params.isOngoing));
    if (params.tags && params.tags.length) queryParams.append('tags', params.tags.join(','));
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.page) queryParams.append('page', String(params.page));
  }

  const queryString = queryParams.toString();
  const url = `/api/media${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest<PaginatedResponse<Media>>('GET', url);
};

export const getMediaById = async (id: string): Promise<Media> => {
  return await apiRequest<Media>('GET', `/api/media/${id}`);
};

export const createMedia = async (mediaData: Partial<Media>): Promise<Media> => {
  return await apiRequest<Media>('POST', '/api/media', mediaData);
};

export const updateMedia = async (id: string, mediaData: Partial<Media>): Promise<Media> => {
  return await apiRequest<Media>('PUT', `/api/media/${id}`, mediaData);
};

export const deleteMedia = async (id: string): Promise<void> => {
  return await apiRequest<void>('DELETE', `/api/media/${id}`);
};

// Episode management
export const addEpisode = async (mediaId: string, episodeData: Episode): Promise<Media> => {
  return await apiRequest<Media>('POST', `/api/media/${mediaId}/episodes`, episodeData);
};

export const updateEpisode = async (mediaId: string, episodeId: string, episodeData: Partial<Episode>): Promise<Media> => {
  return await apiRequest<Media>('PUT', `/api/media/${mediaId}/episodes/${episodeId}`, episodeData);
};

export const deleteEpisode = async (mediaId: string, episodeId: string): Promise<Media> => {
  return await apiRequest<Media>('DELETE', `/api/media/${mediaId}/episodes/${episodeId}`);
};

export const getEpisodeDetails = async (mediaId: string, episodeId: string): Promise<Media> => {
  return await apiRequest<Media>('GET', `/api/media/${mediaId}/${episodeId}`);
};

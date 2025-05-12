import { Maccms, MaccmsSetting } from '../types';
import { apiRequest } from './api';

export const getMaccmsList = async (): Promise<Maccms[]> => {
  return await apiRequest<Maccms[]>('GET', '/api/maccms');
};

export const getMaccmsById = async (id: string): Promise<Maccms> => {
  return await apiRequest<Maccms>('GET', `/api/maccms/${id}`);
};

export const createMaccms = async (maccmsData: Partial<Maccms>): Promise<Maccms> => {
  return await apiRequest<Maccms>('POST', '/api/maccms', maccmsData);
};

export const updateMaccms = async (id: string, maccmsData: Partial<Maccms>): Promise<Maccms> => {
  return await apiRequest<Maccms>('PUT', `/api/maccms/${id}`, maccmsData);
};

export const deleteMaccms = async (id: string): Promise<void> => {
  return await apiRequest<void>('DELETE', `/api/maccms/${id}`);
};

export const configureMaccmsSetting = async (settingData: MaccmsSetting): Promise<MaccmsSetting> => {
  return await apiRequest<MaccmsSetting>('POST', '/api/maccms/setting', settingData);
};

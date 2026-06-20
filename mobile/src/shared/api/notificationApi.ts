import { axiosClient } from './axiosClient';

export const notificationApi = {
  registerToken: (token: string, platform: 'ios' | 'android') =>
    axiosClient.post('/notifications/register', { token, platform }),
};

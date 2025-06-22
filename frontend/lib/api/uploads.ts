'use client';

import { apiRequest } from './client';

export const uploadsApi = {
  uploadImage: async (file: File, accessToken: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<{ url: string }>('/uploads/image', {
      method: 'POST',
      body: formData,
      token: accessToken,
    });
  },
};
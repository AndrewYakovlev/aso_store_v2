import { apiRequest } from './client';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductImageDto {
  url: string;
  alt?: string;
  sortOrder?: number;
  isMain?: boolean;
}

export interface UpdateProductImageDto {
  alt?: string;
  sortOrder?: number;
  isMain?: boolean;
}

export interface ReorderProductImagesDto {
  imageIds: string[];
}

export const productImagesApi = {
  // Загрузить файл изображения
  async uploadImage(
    productId: string,
    file: File,
    data: { alt?: string; isMain?: boolean },
    accessToken: string
  ): Promise<ProductImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (data.alt) formData.append('alt', data.alt);
    if (data.isMain !== undefined) formData.append('isMain', String(data.isMain));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const uploadUrl = `${apiUrl}/products/${productId}/images/upload`;
    console.log('Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Response is not JSON, probably HTML error page
        errorMessage = `Upload failed with status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Добавить изображение по URL
  async create(
    productId: string,
    data: CreateProductImageDto,
    accessToken: string
  ): Promise<ProductImage> {
    return apiRequest(
      `/products/${productId}/images`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        token: accessToken,
      }
    );
  },

  // Получить все изображения товара
  async getAll(productId: string): Promise<ProductImage[]> {
    return apiRequest(`/products/${productId}/images`);
  },

  // Обновить изображение
  async update(
    productId: string,
    imageId: string,
    data: UpdateProductImageDto,
    accessToken: string
  ): Promise<ProductImage> {
    return apiRequest(
      `/products/${productId}/images/${imageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        token: accessToken,
      }
    );
  },

  // Изменить порядок изображений
  async reorder(
    productId: string,
    imageIds: string[],
    accessToken: string
  ): Promise<void> {
    return apiRequest(
      `/products/${productId}/images/reorder`,
      {
        method: 'PATCH',
        body: JSON.stringify({ imageIds }),
        token: accessToken,
      }
    );
  },

  // Удалить изображение
  async remove(
    productId: string,
    imageId: string,
    accessToken: string
  ): Promise<void> {
    return apiRequest(
      `/products/${productId}/images/${imageId}`,
      {
        method: 'DELETE',
        token: accessToken,
      }
    );
  },
};
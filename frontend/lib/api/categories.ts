import { apiRequest } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  children?: Category[];
  parent?: Category;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

interface GetCategoriesParams {
  onlyActive?: boolean;
  includeProductCount?: boolean;
}

export const categoriesApi = {
  async getAll(params?: GetCategoriesParams): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.onlyActive !== undefined) {
      searchParams.append('onlyActive', params.onlyActive.toString());
    }
    
    if (params?.includeProductCount !== undefined) {
      searchParams.append('includeProductCount', params.includeProductCount.toString());
    }
    
    const query = searchParams.toString();
    const url = `/categories${query ? `?${query}` : ''}`;
    
    return apiRequest<Category[]>(url, {
      method: 'GET',
    });
  },

  async getTree(onlyActive: boolean = true): Promise<CategoryTree[]> {
    return apiRequest<CategoryTree[]>(`/categories/tree?onlyActive=${onlyActive}`, {
      method: 'GET',
    });
  },

  async getById(id: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'GET',
    });
  },

  async getBySlug(slug: string): Promise<Category> {
    return apiRequest<Category>(`/categories/slug/${slug}`, {
      method: 'GET',
    });
  },

  async getBreadcrumbs(id: string): Promise<Category[]> {
    return apiRequest<Category[]>(`/categories/${id}/breadcrumbs`, {
      method: 'GET',
    });
  },

  async create(data: CreateCategoryDto, token: string): Promise<Category> {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateCategoryDto, token: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, token: string): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
import { ENV } from "@/config/env";
import type { IProduct, IProductCategory, IStoreService } from "@/types/store.types";
import { apiGet } from "./apiClient";

export const realStoreService: IStoreService = {
  getProducts: async (): Promise<IProduct[]> => {
    try {
      return await apiGet<IProduct[]>(`${ENV.API_BASE_URL}/store/products`);
    } catch {
      return [];
    }
  },

  getProductById: async (id: string): Promise<IProduct> => {
    return apiGet<IProduct>(`${ENV.API_BASE_URL}/store/products/${id}`);
  },

  getProductsByCategory: async (category: IProductCategory): Promise<IProduct[]> => {
    try {
      return await apiGet<IProduct[]>(`${ENV.API_BASE_URL}/store/products?category=${category}`);
    } catch {
      return [];
    }
  },
};

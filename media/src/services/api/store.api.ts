import { ENV } from "@/config/env";
import type { IProduct, IProductCategory, IStoreService } from "@/types/store.types";

export const realStoreService: IStoreService = {
  getProducts: async (): Promise<IProduct[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/store/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  getProductById: async (id: string): Promise<IProduct> => {
    const res = await fetch(`${ENV.API_BASE_URL}/store/products/${id}`);
    if (!res.ok) throw new Error(`Product ${id} not found`);
    return res.json();
  },

  getProductsByCategory: async (category: IProductCategory): Promise<IProduct[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/store/products?category=${category}`);
    if (!res.ok) throw new Error("Failed to fetch products by category");
    return res.json();
  },
};

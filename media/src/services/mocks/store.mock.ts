import { MOCK_PRODUCTS } from "./mockData";
import type { IProduct, IProductCategory, IStoreService } from "@/types/store.types";

export const mockStoreService: IStoreService = {
  getProducts: async (): Promise<IProduct[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PRODUCTS;
  },

  getProductById: async (id: string): Promise<IProduct> => {
    await new Promise((r) => setTimeout(r, 200));
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return product;
  },

  getProductsByCategory: async (category: IProductCategory): Promise<IProduct[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_PRODUCTS.filter((p) => p.category === category);
  },
};

export type IProductCategory = "vinyl" | "merch" | "digital" | "bundle";

export interface IProduct {
  id: string;
  name: string;
  artist: string;
  category: IProductCategory;
  price: number; // USD cents
  image: string;
  description?: string;
  inStock: boolean;
  rating?: number; // 0-5
  reviewCount?: number;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export interface ICartState {
  items: ICartItem[];
  addItem: (product: IProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export interface IProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct) => void;
}

export interface IStoreService {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct>;
  getProductsByCategory(category: IProductCategory): Promise<IProduct[]>;
}

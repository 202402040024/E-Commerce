export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: IReview[];
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
  productId: string | IProduct;
  quantity: number;
  _id?: string;
}

export interface ICart {
  _id: string;
  userId: string;
  products: ICartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IWishlistItem {
  productId: string | IProduct;
  _id?: string;
}

export interface IWishlist {
  _id: string;
  userId: string;
  products: IWishlistItem[];
}

export interface IOrderItem {
  productId: string | IProduct;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface IOrder {
  _id: string;
  userId: string | IUser;
  products: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: IOrder[];
  revenueData: { date: string; revenue: number }[];
  userGrowth: { date: string; users: number }[];
  topProducts: { product: IProduct; sold: number }[];
}

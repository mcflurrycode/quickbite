export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Popular' | 'Combos' | 'Mains' | 'Sides' | 'Drinks' | 'Desserts';
  calories?: number;
  prepTimeMinutes?: number;
  dietary?: ('Vegan' | 'Vegetarian' | 'Halal' | 'Gluten-Free' | 'Spicy')[];
  studentSpecial?: boolean;
  studentDiscountPrice?: number;
  customization?: {
    sizes?: { name: string; extraPrice: number }[];
    spiceLevels?: string[];
    addOns?: { name: string; price: number }[];
  };
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  prepTime: string;
  distance: string;
  priceRange: '$' | '$$' | '$$$';
  deliveryFee: number;
  isCampusPartner: boolean;
  studentDiscountNotice?: string;
  image: string;
  coverImage: string;
  menu: MenuItem[];
}

export interface CartItemOption {
  size?: string;
  spiceLevel?: string;
  addOns?: string[];
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string; // unique ID for item + options combination
  item: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  selectedOptions: CartItemOption;
  itemTotal: number;
}

export type PaymentMethodType = 'apple_pay' | 'google_pay' | 'campus_card' | 'credit_card' | 'klarna';

export interface PaymentDetails {
  method: PaymentMethodType;
  cardLast4?: string;
  campusCardId?: string;
  campusBalanceRemaining?: number;
}

export interface SplitMember {
  id: string;
  name: string;
  share: number;
  hasPaid: boolean;
}

export interface OrderMilestone {
  title: string;
  description: string;
  time: string;
  completed: boolean;
  active: boolean;
}

export interface CourierInfo {
  name: string;
  avatar: string;
  vehicle: string;
  plate: string;
  rating: number;
  deliveryCount: number;
  phone: string;
  currentLat: number;
  currentLng: number;
}

export interface Order {
  id: string;
  createdAt: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  studentDiscount: number;
  deliveryFee: number;
  platformFee: number;
  tip: number;
  total: number;
  deliveryAddress: string;
  status: 'placed' | 'cooking' | 'picked_up' | 'arriving' | 'delivered';
  estimatedDeliveryMinutes: number;
  orderPin: string;
  courier: CourierInfo;
  paymentDetails: PaymentDetails;
  splitMembers?: SplitMember[];
  rating?: number;
  reviewFeedback?: string[];
}

export type AppTab = 'dashboard' | 'menu' | 'cart' | 'tracking' | 'history';

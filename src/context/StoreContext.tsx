'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, HairConcernType } from '@/types';
import { PRODUCTS } from '@/data/products';

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  theme: 'dark' | 'light';
  currency: 'INR' | 'USD' | 'EUR';
  selectedConcern: HairConcernType | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isMegaMenuOpen: boolean;
  isAIAdvisorOpen: boolean;
  isCompareOpen: boolean;
  quickViewProduct: Product | null;
  compareList: Product[];
  toastMessage: string | null;

  // Coupon state
  appliedCoupon: string | null;
  discountAmount: number;
  freeGift: string | null;

  // Actions
  toggleTheme: () => void;
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void;
  setSelectedConcern: (c: HairConcernType | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsMegaMenuOpen: (open: boolean) => void;
  setIsAIAdvisorOpen: (open: boolean) => void;
  setIsCompareOpen: (open: boolean) => void;
  setQuickViewProduct: (p: Product | null) => void;
  
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;

  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  
  showToast: (msg: string) => void;
  formatPrice: (amountInINR: number) => string;
  
  cartSubtotal: number;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['elixir-royal-luxe']);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [selectedConcern, setSelectedConcern] = useState<HairConcernType | null>(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('ARGANCOMBO');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [freeGift, setFreeGift] = useState<string | null>('Botox Travel Kit (Worth ₹990)');

  // Initialize theme class on document body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Pre-load initial sample items in cart for rich demonstration
  useEffect(() => {
    setCart([
      { product: PRODUCTS[0], quantity: 1 },
      { product: PRODUCTS[1], quantity: 1 }
    ]);
  }, []);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Recalculate coupon discount when subtotal or coupon changes
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountAmount(0);
      setFreeGift(null);
      return;
    }

    const code = appliedCoupon.toUpperCase();
    if (code === 'GOLD20') {
      setDiscountAmount(Math.round(cartSubtotal * 0.20));
      setFreeGift(null);
    } else if (code === 'ARGANCOMBO') {
      setDiscountAmount(0);
      setFreeGift('Free Botox Travel Kit (Worth ₹990)');
    } else if (code === 'NEOPLEX10') {
      setDiscountAmount(Math.round(cartSubtotal * 0.10));
      setFreeGift('2 Free Neoplex Minis');
    } else if (code === 'FREESHIP') {
      setDiscountAmount(0);
      setFreeGift('Free Express 24-Hr Salon Delivery');
    } else {
      setDiscountAmount(0);
      setFreeGift(null);
    }
  }, [cartSubtotal, appliedCoupon]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to Bag`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Vault');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to Vault');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 items allowed in comparison');
        return prev;
      }
      showToast(`Added ${product.name} to Comparison`);
      return [...prev, product];
    });
  };

  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const validCodes = ['GOLD20', 'ARGANCOMBO', 'NEOPLEX10', 'FREESHIP'];
    if (validCodes.includes(clean)) {
      setAppliedCoupon(clean);
      showToast(`Coupon '${clean}' applied successfully!`);
      return true;
    } else {
      showToast(`Invalid coupon code: '${code}'`);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFreeGift(null);
    showToast('Coupon code removed');
  };

  const formatPrice = (amountInUSD: number) => {
    switch (currency) {
      case 'USD':
        return `$${amountInUSD.toFixed(2)}`;
      case 'EUR':
        return `€${(amountInUSD * 0.92).toFixed(2)}`;
      default:
        // INR (Rupees) - standard conversion rate 84 (e.g. 15 USD = 1260 INR)
        return `₹${Math.round(amountInUSD * 84).toLocaleString('en-IN')}`;
    }
  };


  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        theme,
        currency,
        selectedConcern,
        isCartOpen,
        isWishlistOpen,
        isSearchOpen,
        isMegaMenuOpen,
        isAIAdvisorOpen,
        isCompareOpen,
        quickViewProduct,
        compareList,
        toastMessage,

        appliedCoupon,
        discountAmount,
        freeGift,

        toggleTheme,
        setCurrency,
        setSelectedConcern,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsSearchOpen,
        setIsMegaMenuOpen,
        setIsAIAdvisorOpen,
        setIsCompareOpen,
        setQuickViewProduct,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        isInCompare,
        applyCoupon,
        removeCoupon,
        showToast,
        formatPrice,

        cartSubtotal,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

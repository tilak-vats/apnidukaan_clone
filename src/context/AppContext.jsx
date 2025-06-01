'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { generateEAN13 } from '../utils/barcodeGenerator';

const AppContext = createContext(undefined);
const TOKEN_KEY = 'auth_token';

const fetcher = async (url) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('No token found');

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API request failed');
  }
  return res.json();
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const { data: products = [], error: productsError, mutate: mutateProducts } = useSWR('/api/products', fetcher);
  const { data: customers = [], error: customersError, mutate: mutateCustomers } = useSWR('/api/customers', fetcher);
  const { data: sales = [], error: salesError, mutate: mutateSales } = useSWR('/api/sales', fetcher);

  const loading = !products || !customers || !sales;

  const analytics = {
    totalProducts: products.length,
    inventoryWorth: products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0),
    totalSales: sales.reduce((acc, s) => acc + s.total, 0),
    totalCheckouts: sales.length,
    todaysIncome: sales
      .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((acc, s) => acc + s.total, 0),
  };

  const refreshData = useCallback(async () => {
    await Promise.all([
      mutateProducts(),
      mutateCustomers(),
      mutateSales(),
    ]);
  }, [mutateProducts, mutateCustomers, mutateSales]);

  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const finalBarcode = productData.barcode || generateEAN13();
      
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productData,
          barcode: finalBarcode,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add product');
      }

      await mutateProducts();
      return await res.json();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update product');
      }

      await mutateProducts();
      return await res.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      await mutateProducts();
      return await res.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }
      return [...currentCart, { ...product, cartQuantity: quantity }];
    });
  }, []);

  const updateCartItem = useCallback((id, quantity) => {
    setCart(currentCart => {
      if (quantity <= 0) {
        return currentCart.filter(item => item.id !== id);
      }
      return currentCart.map(item =>
        item.id === id ? { ...item, cartQuantity: quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const checkout = async (customerPhone) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerPhone,
          cart,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Checkout failed');
      }

      clearCart();
      await Promise.all([
        mutateProducts(),
        mutateCustomers(),
        mutateSales(),
      ]);
      
      return await res.json();
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };

  const value = {
    products,
    customers,
    sales,
    cart,
    analytics,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
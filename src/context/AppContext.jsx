'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateEAN13 } from '../utils/barcodeGenerator';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const analytics = {
    totalProducts: products.length,
    inventoryWorth: products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0),
    totalSales: sales.reduce((acc, s) => acc + s.total, 0),
    totalCheckouts: sales.length,
    todaysIncome: sales
      .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((acc, s) => acc + s.total, 0),
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const fetchData = async () => {
    setLoading(true);
    const headers = getAuthHeaders();

    if (!headers['Authorization']) {
      setLoading(false);
      setProducts([]);
      setCustomers([]);
      setSales([]);
      return;
    }

    try {
      const [productsRes, customersRes, salesRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/sales', { headers }),
      ]);

      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      const salesData = await salesRes.json();

      if (productsRes.ok) {
        const mappedProducts = productsData.map(p => ({ ...p, id: p._id.toString() }));
        setProducts(mappedProducts);
      } else {
        console.error('Failed to fetch products:', productsData.message);
        if (productsRes.status === 401) {
          setProducts([]);
        }
      }

      if (customersRes.ok) {
        const mappedCustomers = customersData.map(c => ({ ...c, id: c._id.toString() }));
        setCustomers(mappedCustomers);
      } else {
        console.error('Failed to fetch customers:', customersData.message);
        if (customersRes.status === 401) {
          setCustomers([]);
        }
      }

      if (salesRes.ok) {
        const mappedSales = salesData.map(s => ({
          ...s,
          id: s._id.toString(),
          items: s.items.map(item => ({
            ...item,
            id: item.productId.toString()
          }))
        }));
        setSales(mappedSales);
      } else {
        console.error('Failed to fetch sales:', salesData.message);
        if (salesRes.status === 401) {
          setSales([]);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProduct = async (productData) => {
    try {
      const finalBarcode = productData.barcode || generateEAN13();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...productData,
          barcode: finalBarcode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add product');
      }
      await fetchData();
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
      await fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProductByBarcode = (barcode) => {
    return products.find(p => p.barcode === barcode);
  };

  const searchProducts = (query) => {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(lowercaseQuery) ||
        p.barcode.includes(query)
    );
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, cartQuantity: item.cartQuantity + quantity }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, cartQuantity: quantity }]);
    }
  };

  const updateCartItem = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, cartQuantity: quantity } : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async (customerPhone) => {
    if (cart.length === 0) return;

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerPhone,
          total: cart.reduce((sum, item) => sum + item.discountedPrice * item.cartQuantity, 0),
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            barcode: item.barcode,
            discountedPrice: item.discountedPrice,
            cartQuantity: item.cartQuantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Checkout failed');
      }
      setCart([]);
      await fetchData();
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };

  const value = {
    products,
    cart,
    customers,
    sales,
    analytics,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    searchProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    loading,
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
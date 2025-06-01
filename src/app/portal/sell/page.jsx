'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ScanLine, Plus, Phone, X, Check } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import CartItem from '../../components/ui/CartItem';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const SellPage = () => {
  const { products, cart, addToCart, clearCart, checkout } = useAppContext();
  const [scanning, setScanning] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.discountedPrice * item.cartQuantity), 0);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  const simulateScan = () => {
    if (products.length === 0) {
      return;
    }

    setScanning(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * products.length);
      const randomProduct = products[randomIndex];

      if (randomProduct) {
        addToCart(randomProduct, 1);
      }

      setScanning(false);
    }, 1000);
  };

  const handleCheckout = async () => {
    if (!customerPhone) {
      alert('Please enter customer phone number');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    await checkout(customerPhone);
    setCheckoutSuccess(true);
    setCustomerPhone('');

    setTimeout(() => {
      setCheckoutSuccess(false);
    }, 3000);
  };

  const handleAddProduct = (product) => {
    addToCart(product, 1);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 flex flex-col">
        <div className="card mb-4 overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-indigo-900 flex items-center">
              <ScanLine size={20} className="mr-2" />
              Scan Products
            </h2>
            <button
              className="btn btn-primary"
              onClick={simulateScan}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Scan Product'}
            </button>
          </div>
          <div className="p-6 flex items-center justify-center bg-white">
            {scanning ? (
              <div className="text-center py-8">
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-indigo-500 animate-pulse rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-slate-600">Scanning product, please wait...</p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ScanLine size={48} className="mx-auto mb-3 text-slate-400" />
                <p>Click the scan button to scan a product</p>
                <p className="text-xs mt-2">For demonstration purposes, this will add a random product</p>
              </div>
            )}
          </div>
        </div>

        <div className="card flex-1">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium mb-2">Search Products</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or barcode..."
                className="input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[30vh]">
            {searchResults.length === 0 && searchQuery ? (
              <div className="p-6 text-center text-slate-500">
                No products found
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {searchResults.map(product => (
                  <li
                    key={product.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500">Barcode: {product.barcode}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-3">₹{product.discountedPrice}</span>
                        <button className="btn btn-ghost p-1">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 flex flex-col">
        <div className="card flex-1 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Shopping Cart
            </h2>
            {cart.length > 0 && (
              <button
                className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 380px)' }}>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Your cart is empty</p>
                <p className="text-sm mt-2">Scan products or search to add items</p>
              </div>
            ) : (
              <div>
                {cart.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-xl font-bold">₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="mb-4">
              <label htmlFor="customerPhone" className="label flex mb-3 items-center">
                <Phone size={16} className="mr-1" />
                Customer Phone
              </label>
              <input
                type="tel"
                id="customerPhone"
                className="input w-full"
                placeholder="Enter customer phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <button
              className="btn btn-primary w-full py-3"
              onClick={handleCheckout}
              disabled={cart.length === 0 || !customerPhone}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {checkoutSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Checkout Successful!</h2>
            <p className="text-slate-600 mb-6">The sale has been recorded successfully.</p>
            <button
              className="btn btn-primary w-full"
              onClick={() => setCheckoutSuccess(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellPage;
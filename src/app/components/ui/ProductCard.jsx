'use client';

import React, { useState } from 'react';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const ProductCard = ({ product, onEdit }) => {
  const { addToCart, deleteProduct } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleDelete = async () => {
    if (showConfirm) {
      await deleteProduct(product.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const calculateDiscount = () => {
    if (product.originalPrice <= 0) return 0;
    const discount = ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100;
    return Math.round(discount);
  };

  const discountPercent = calculateDiscount();

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Barcode: {product.barcode}</p>
          </div>
          {discountPercent > 0 && (
            <span className="badge badge-accent">-{discountPercent}%</span>
          )}
        </div>

        <div className="mt-4 flex items-baseline">
          <span className="text-lg font-semibold text-slate-900">₹{product.discountedPrice}</span>
          {product.originalPrice > product.discountedPrice && (
            <span className="ml-2 text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        <div className="mt-2 flex justify-between items-center">
          <span className={`text-sm ${
            product.quantity > 10
              ? 'text-green-600'
              : product.quantity > 0
                ? 'text-yellow-600'
                : 'text-red-600'
          }`}>
            {product.quantity > 0 ? `In stock: ${product.quantity}` : 'Out of stock'}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-2 flex justify-between">
        <div className="flex space-x-1">
          <button
            className="btn btn-ghost p-2"
            onClick={() => onEdit(product)}
          >
            <Edit size={16} />
          </button>
          <button
            className={`btn ${showConfirm ? 'btn-danger' : 'btn-ghost'} p-2`}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <button
          className="btn btn-primary p-2"
          onClick={handleAddToCart}
          disabled={product.quantity <= 0}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
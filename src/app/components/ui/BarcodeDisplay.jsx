'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeDisplay = ({
  value,
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  margin = 10,
}) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'EAN13',
          width,
          height,
          displayValue,
          fontSize,
          margin,
          text: value,
          textMargin: 8,
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, width, height, displayValue, fontSize, margin]);

  if (!value) {
    return <div className="text-center text-slate-500">No barcode value provided</div>;
  }

  return (
    <div className="flex justify-center p-4">
      <svg ref={barcodeRef} className="w-full"></svg>
    </div>
  );
};

export default BarcodeDisplay;
export const isValidEAN13 = (barcode) => {
  if (!/^\d{13}$/.test(barcode)) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(barcode[12]) === checkDigit;
};

export const generateEAN13 = () => {
  let barcode = '890';
  for (let i = 0; i < 9; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return barcode + checkDigit.toString();
};
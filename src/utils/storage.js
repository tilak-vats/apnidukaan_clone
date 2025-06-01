import localforage from 'localforage';

localforage.config({
  name: 'apni-dukaan',
  storeName: 'inventory',
});

export const getProducts = async () => {
  try {
    const products = await localforage.getItem('products');
    return products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const saveProducts = async (products) => {
  try {
    await localforage.setItem('products', products);
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const products = await getProducts();
    return products.find(p => p.barcode === barcode) || null;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return null;
  }
};

export const getCustomers = async () => {
  try {
    const customers = await localforage.getItem('customers');
    return customers || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const saveCustomers = async (customers) => {
  try {
    await localforage.setItem('customers', customers);
  } catch (error) {
    console.error('Error saving customers:', error);
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const customers = await getCustomers();
    return customers.find(c => c.phoneNumber === phone) || null;
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    return null;
  }
};
export const getSales = async () => {
  try {
    const sales = await localforage.getItem('sales');
    return sales || [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

export const saveSales = async (sales) => {
  try {
    await localforage.setItem('sales', sales);
  } catch (error) {
    console.error('Error saving sales:', error);
  }
};
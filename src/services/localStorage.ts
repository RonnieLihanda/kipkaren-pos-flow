
// Type definitions for our data models
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  password: string; // In a real app, we'd use proper authentication
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  supplier: string;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  staffId: string;
  staffName: string;
  customerName?: string;
  reference?: string; // M-Pesa reference number
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Delivery {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: DeliveryItem[];
  cost: number;
  notes?: string;
}

export interface DeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
}

// Default data for initial setup
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@mic3hardware.com',
    role: 'admin',
    password: 'admin123', // Never do this in production
  },
  {
    id: '2',
    name: 'Cashier',
    email: 'cashier@mic3hardware.com',
    role: 'cashier',
    password: 'cashier123', // Never do this in production
  },
];

const defaultCategories = [
  'Cement',
  'Tools',
  'Plumbing',
  'Electrical',
  'Paint',
  'Hardware',
  'Other'
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Bamburi Cement 50kg',
    category: 'Cement',
    sku: 'CEM001',
    buyingPrice: 650,
    sellingPrice: 750,
    quantity: 50,
    supplier: 'Bamburi Distributors',
    reorderLevel: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Hammer',
    category: 'Tools',
    sku: 'TL001',
    buyingPrice: 300,
    sellingPrice: 450,
    quantity: 15,
    supplier: 'Tools Supplier Ltd',
    reorderLevel: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'PVC Pipe 1/2 inch',
    category: 'Plumbing',
    sku: 'PL001',
    buyingPrice: 120,
    sellingPrice: 180,
    quantity: 100,
    supplier: 'Plumbing World',
    reorderLevel: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Light Bulb 60W',
    category: 'Electrical',
    sku: 'EL001',
    buyingPrice: 50,
    sellingPrice: 100,
    quantity: 30,
    supplier: 'Electrical Supplies Kenya',
    reorderLevel: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Crown Paint 4L White',
    category: 'Paint',
    sku: 'PT001',
    buyingPrice: 800,
    sellingPrice: 1200,
    quantity: 10,
    supplier: 'Crown Paints',
    reorderLevel: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'John Supplier',
    phone: '0700123456',
    company: 'Bamburi Distributors',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mary Supplier',
    phone: '0711234567',
    company: 'Tools Supplier Ltd',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Peter Supplier',
    phone: '0722345678',
    company: 'Plumbing World',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Susan Supplier',
    phone: '0733456789',
    company: 'Electrical Supplies Kenya',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Robert Supplier',
    phone: '0744567890',
    company: 'Crown Paints',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// LocalStorage service
class LocalStorageService {
  // Initialize data for first-time users
  initialize() {
    if (!localStorage.getItem('pos_users')) {
      localStorage.setItem('pos_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('pos_products')) {
      localStorage.setItem('pos_products', JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem('pos_suppliers')) {
      localStorage.setItem('pos_suppliers', JSON.stringify(defaultSuppliers));
    }
    if (!localStorage.getItem('pos_sales')) {
      localStorage.setItem('pos_sales', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_expenses')) {
      localStorage.setItem('pos_expenses', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_deliveries')) {
      localStorage.setItem('pos_deliveries', JSON.stringify([]));
    }
    if (!localStorage.getItem('pos_categories')) {
      localStorage.setItem('pos_categories', JSON.stringify(defaultCategories));
    }
  }

  // User operations
  getUsers(): User[] {
    const users = localStorage.getItem('pos_users');
    return users ? JSON.parse(users) : [];
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find((user) => user.email === email) || null;
  }

  saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('pos_users', JSON.stringify(users));
  }

  // Product operations
  getProducts(): Product[] {
    const products = localStorage.getItem('pos_products');
    return products ? JSON.parse(products) : [];
  }

  getProductById(id: string): Product | null {
    const products = this.getProducts();
    return products.find((product) => product.id === id) || null;
  }

  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem('pos_products', JSON.stringify(products));
  }

  deleteProduct(id: string) {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem('pos_products', JSON.stringify(products));
  }

  // Supplier operations
  getSuppliers(): Supplier[] {
    const suppliers = localStorage.getItem('pos_suppliers');
    return suppliers ? JSON.parse(suppliers) : [];
  }

  getSupplierById(id: string): Supplier | null {
    const suppliers = this.getSuppliers();
    return suppliers.find((supplier) => supplier.id === id) || null;
  }

  saveSupplier(supplier: Supplier) {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === supplier.id);
    if (index !== -1) {
      suppliers[index] = supplier;
    } else {
      suppliers.push(supplier);
    }
    localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
  }

  deleteSupplier(id: string) {
    const suppliers = this.getSuppliers().filter((s) => s.id !== id);
    localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
  }

  // Sale operations
  getSales(): Sale[] {
    const sales = localStorage.getItem('pos_sales');
    return sales ? JSON.parse(sales) : [];
  }

  getSaleById(id: string): Sale | null {
    const sales = this.getSales();
    return sales.find((sale) => sale.id === id) || null;
  }

  saveSale(sale: Sale) {
    const sales = this.getSales();
    const index = sales.findIndex((s) => s.id === sale.id);
    if (index !== -1) {
      sales[index] = sale;
    } else {
      sales.push(sale);
    }
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }

  deleteSale(id: string) {
    const sales = this.getSales().filter((s) => s.id !== id);
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }

  // Expense operations
  getExpenses(): Expense[] {
    const expenses = localStorage.getItem('pos_expenses');
    return expenses ? JSON.parse(expenses) : [];
  }

  getExpenseById(id: string): Expense | null {
    const expenses = this.getExpenses();
    return expenses.find((expense) => expense.id === id) || null;
  }

  saveExpense(expense: Expense) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      expenses[index] = expense;
    } else {
      expenses.push(expense);
    }
    localStorage.setItem('pos_expenses', JSON.stringify(expenses));
  }

  deleteExpense(id: string) {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    localStorage.setItem('pos_expenses', JSON.stringify(expenses));
  }

  // Delivery operations
  getDeliveries(): Delivery[] {
    const deliveries = localStorage.getItem('pos_deliveries');
    return deliveries ? JSON.parse(deliveries) : [];
  }

  getDeliveryById(id: string): Delivery | null {
    const deliveries = this.getDeliveries();
    return deliveries.find((delivery) => delivery.id === id) || null;
  }

  saveDelivery(delivery: Delivery) {
    const deliveries = this.getDeliveries();
    const index = deliveries.findIndex((d) => d.id === delivery.id);
    if (index !== -1) {
      deliveries[index] = delivery;
    } else {
      deliveries.push(delivery);
    }
    localStorage.setItem('pos_deliveries', JSON.stringify(deliveries));
  }

  deleteDelivery(id: string) {
    const deliveries = this.getDeliveries().filter((d) => d.id !== id);
    localStorage.setItem('pos_deliveries', JSON.stringify(deliveries));
  }

  // Category operations
  getCategories(): string[] {
    const categories = localStorage.getItem('pos_categories');
    return categories ? JSON.parse(categories) : [];
  }

  saveCategory(category: string) {
    const categories = this.getCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      localStorage.setItem('pos_categories', JSON.stringify(categories));
    }
  }

  deleteCategory(category: string) {
    const categories = this.getCategories().filter((c) => c !== category);
    localStorage.setItem('pos_categories', JSON.stringify(categories));
  }

  // Helper to update product quantity after sale
  updateProductQuantities(saleItems: SaleItem[]) {
    const products = this.getProducts();
    
    saleItems.forEach((item) => {
      const productIndex = products.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity -= item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    });
    
    localStorage.setItem('pos_products', JSON.stringify(products));
  }

  // Helper to update product quantity after delivery
  updateProductQuantitiesFromDelivery(deliveryItems: DeliveryItem[]) {
    const products = this.getProducts();
    
    deliveryItems.forEach((item) => {
      const productIndex = products.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity += item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    });
    
    localStorage.setItem('pos_products', JSON.stringify(products));
  }
}

export const localStorageService = new LocalStorageService();

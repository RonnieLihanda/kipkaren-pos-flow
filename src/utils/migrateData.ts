
import { localStorageService } from '../services/localStorage';
import { supabaseService } from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';

export const migrateData = async () => {
  try {
    // Migrate categories
    const categories = localStorageService.getCategories();
    for (const category of categories) {
      await supabaseService.saveCategory(category);
    }
    
    // Migrate suppliers
    const suppliers = localStorageService.getSuppliers();
    const supplierMap = new Map(); // To map old IDs to new IDs
    
    for (const supplier of suppliers) {
      const newSupplier = await supabaseService.saveSupplier({
        name: supplier.name,
        phone: supplier.phone,
        company: supplier.company
      });
      
      if (newSupplier) {
        supplierMap.set(supplier.id, newSupplier.id);
      }
    }
    
    // Migrate products
    const products = localStorageService.getProducts();
    const productMap = new Map(); // To map old IDs to new IDs
    
    for (const product of products) {
      const supplierId = supplierMap.get(product.supplier);
      
      const newProduct = await supabaseService.saveProduct({
        name: product.name,
        category: product.category,
        sku: product.sku,
        buying_price: product.buyingPrice,
        selling_price: product.sellingPrice,
        quantity: product.quantity,
        supplier_id: supplierId,
        reorder_level: product.reorderLevel
      });
      
      if (newProduct) {
        productMap.set(product.id, newProduct.id);
      }
    }
    
    // Migrate sales and sale items
    const sales = localStorageService.getSales();
    
    for (const sale of sales) {
      const saleData = {
        total: sale.total,
        payment_method: sale.paymentMethod,
        staff_id: sale.staffId,
        staff_name: sale.staffName,
        customer_name: sale.customerName,
        reference: sale.reference,
        created_at: sale.createdAt
      };
      
      const saleItems = sale.items.map(item => ({
        product_id: productMap.get(item.productId) || item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }));
      
      await supabaseService.saveSale(saleData, saleItems);
    }
    
    // Migrate expenses
    const expenses = localStorageService.getExpenses();
    
    for (const expense of expenses) {
      await supabaseService.saveExpense({
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes
      });
    }
    
    // Migrate deliveries would be added here
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

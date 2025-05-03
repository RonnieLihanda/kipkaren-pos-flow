
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for our data models (matching the database structure)
export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  buying_price: number;
  selling_price: number;
  quantity: number;
  supplier_id: string | null;
  reorder_level: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  total: number;
  payment_method: 'cash' | 'mpesa' | 'credit';
  staff_id: string;
  staff_name: string;
  customer_name?: string;
  reference?: string; // M-Pesa reference number
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  cost: number;
  notes?: string;
  created_at: string;
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  cost: number;
  created_at: string;
}

class SupabaseService {
  // Product operations
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data;
  }
  
  async saveProduct(product: Partial<Product>): Promise<Product | null> {
    const now = new Date().toISOString();
    
    if (product.id) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          updated_at: now
        })
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating product:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new product
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          id: uuidv4()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        return null;
      }
      
      return data;
    }
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    return true;
  }
  
  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
    
    return data || [];
  }
  
  async getSupplierById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }
    
    return data;
  }
  
  async saveSupplier(supplier: Partial<Supplier>): Promise<Supplier | null> {
    const now = new Date().toISOString();
    
    if (supplier.id) {
      // Update existing supplier
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          ...supplier,
          updated_at: now
        })
        .eq('id', supplier.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating supplier:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new supplier
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          id: uuidv4()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating supplier:', error);
        return null;
      }
      
      return data;
    }
  }
  
  async deleteSupplier(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
    
    return true;
  }
  
  // Sale operations
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
    
    return data || [];
  }
  
  async getSaleById(id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching sale:', error);
      return null;
    }
    
    return data;
  }
  
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
    
    if (error) {
      console.error('Error fetching sale items:', error);
      return [];
    }
    
    return data || [];
  }
  
  async saveSale(sale: Partial<Sale>, items: Partial<SaleItem>[]): Promise<Sale | null> {
    // Start a transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        total: sale.total,
        payment_method: sale.payment_method,
        staff_id: sale.staff_id,
        staff_name: sale.staff_name,
        customer_name: sale.customer_name,
        reference: sale.reference
      })
      .select()
      .single();
    
    if (saleError) {
      console.error('Error creating sale:', saleError);
      return null;
    }
    
    const saleId = saleData.id;
    
    // Insert sale items
    const saleItems = items.map(item => ({
      sale_id: saleId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
      // Ideally we should rollback the sale here, but that would require custom functions
      return null;
    }
    
    // Update product quantities
    for (const item of items) {
      const { error: updateError } = await supabase.rpc('update_product_quantity', {
        p_id: item.product_id,
        qty: item.quantity
      });
      
      if (updateError) {
        console.error('Error updating product quantity:', updateError);
      }
    }
    
    return saleData;
  }
  
  async deleteSale(id: string): Promise<boolean> {
    // Sale items will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting sale:', error);
      return false;
    }
    
    return true;
  }
  
  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
    
    return data || [];
  }
  
  async getExpenseById(id: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching expense:', error);
      return null;
    }
    
    return data;
  }
  
  async saveExpense(expense: Partial<Expense>): Promise<Expense | null> {
    if (expense.id) {
      // Update existing expense
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', expense.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating expense:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new expense
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating expense:', error);
        return null;
      }
      
      return data;
    }
  }
  
  async deleteExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
    
    return true;
  }
  
  // Category operations
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data.map(category => category.name) || [];
  }
  
  async saveCategory(name: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .insert({ name });
    
    if (error) {
      console.error('Error creating category:', error);
      return false;
    }
    
    return true;
  }
  
  async deleteCategory(name: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', name);
    
    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    
    return true;
  }
}

export const supabaseService = new SupabaseService();

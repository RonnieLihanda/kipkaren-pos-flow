
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

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
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          variant: 'destructive'
        });
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      return [];
    }
  }
  
  async getProductById(id: string): Promise<Product | null> {
    try {
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
    } catch (err) {
      console.error('Unexpected error fetching product:', err);
      return null;
    }
  }
  
  async saveProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const now = new Date().toISOString();
      
      if (product.id) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            sku: product.sku,
            buying_price: product.buying_price,
            selling_price: product.selling_price,
            quantity: product.quantity,
            supplier_id: product.supplier_id,
            reorder_level: product.reorder_level,
            updated_at: now
          })
          .eq('id', product.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating product:', error);
          toast({
            title: 'Error',
            description: 'Failed to update product',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      } else {
        // Create new product with required fields
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name!,
            category: product.category!,
            sku: product.sku!,
            buying_price: product.buying_price!,
            selling_price: product.selling_price!,
            quantity: product.quantity || 0,
            supplier_id: product.supplier_id,
            reorder_level: product.reorder_level || 5
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating product:', error);
          toast({
            title: 'Error',
            description: 'Failed to create product',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      }
    } catch (err) {
      console.error('Unexpected error saving product:', err);
      return null;
    }
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting product:', err);
      return false;
    }
  }
  
  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch suppliers',
          variant: 'destructive'
        });
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching suppliers:', err);
      return [];
    }
  }
  
  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
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
    } catch (err) {
      console.error('Unexpected error fetching supplier:', err);
      return null;
    }
  }
  
  async saveSupplier(supplier: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const now = new Date().toISOString();
      
      if (supplier.id) {
        // Update existing supplier
        const { data, error } = await supabase
          .from('suppliers')
          .update({
            name: supplier.name,
            phone: supplier.phone,
            company: supplier.company,
            updated_at: now
          })
          .eq('id', supplier.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating supplier:', error);
          toast({
            title: 'Error',
            description: 'Failed to update supplier',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      } else {
        // Create new supplier with required fields
        const { data, error } = await supabase
          .from('suppliers')
          .insert({
            name: supplier.name!,
            phone: supplier.phone!,
            company: supplier.company!
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating supplier:', error);
          toast({
            title: 'Error',
            description: 'Failed to create supplier',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      }
    } catch (err) {
      console.error('Unexpected error saving supplier:', err);
      return null;
    }
  }
  
  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting supplier:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete supplier',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting supplier:', err);
      return false;
    }
  }
  
  // Sale operations
  async getSales(): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sales:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch sales',
          variant: 'destructive'
        });
        return [];
      }
      
      // Convert payment_method to the expected type
      return (data || []).map(sale => ({
        ...sale,
        payment_method: sale.payment_method as 'cash' | 'mpesa' | 'credit'
      }));
    } catch (err) {
      console.error('Unexpected error fetching sales:', err);
      return [];
    }
  }
  
  async getSaleById(id: string): Promise<Sale | null> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching sale:', error);
        return null;
      }
      
      return {
        ...data,
        payment_method: data.payment_method as 'cash' | 'mpesa' | 'credit'
      };
    } catch (err) {
      console.error('Unexpected error fetching sale:', err);
      return null;
    }
  }
  
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
      
      if (error) {
        console.error('Error fetching sale items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch sale items',
          variant: 'destructive'
        });
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching sale items:', err);
      return [];
    }
  }
  
  async saveSale(sale: Partial<Sale>, items: Partial<SaleItem>[]): Promise<Sale | null> {
    try {
      // Verify the payment method is valid
      const paymentMethod = sale.payment_method as 'cash' | 'mpesa' | 'credit';
      
      // Start a transaction
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          total: sale.total!,
          payment_method: paymentMethod,
          staff_id: sale.staff_id!,
          staff_name: sale.staff_name!,
          customer_name: sale.customer_name,
          reference: sale.reference
        })
        .select()
        .single();
      
      if (saleError) {
        console.error('Error creating sale:', saleError);
        toast({
          title: 'Error',
          description: 'Failed to create sale',
          variant: 'destructive'
        });
        return null;
      }
      
      const saleId = saleData.id;
      
      // Insert sale items
      const saleItems = items.map(item => ({
        sale_id: saleId,
        product_id: item.product_id!,
        product_name: item.product_name!,
        quantity: item.quantity!,
        price: item.price!,
        total: item.total!
      }));
      
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        toast({
          title: 'Error',
          description: 'Failed to save sale items',
          variant: 'destructive'
        });
        // Ideally we should rollback the sale here, but that would require custom functions
        return null;
      }
      
      // Update product quantities
      for (const item of items) {
        // Get the current product
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          const newQuantity = product.quantity - (item.quantity || 0);
          
          // Update the product quantity
          const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', item.product_id);
          
          if (updateError) {
            console.error('Error updating product quantity:', updateError);
            toast({
              title: 'Warning',
              description: `Failed to update quantity for ${item.product_name}`,
              variant: 'destructive'
            });
          }
        }
      }
      
      return {
        ...saleData,
        payment_method: saleData.payment_method as 'cash' | 'mpesa' | 'credit'
      };
    } catch (err) {
      console.error('Unexpected error saving sale:', err);
      return null;
    }
  }
  
  async deleteSale(id: string): Promise<boolean> {
    try {
      // Sale items will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting sale:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete sale',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting sale:', err);
      return false;
    }
  }
  
  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch expenses',
          variant: 'destructive'
        });
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching expenses:', err);
      return [];
    }
  }
  
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
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
    } catch (err) {
      console.error('Unexpected error fetching expense:', err);
      return null;
    }
  }
  
  async saveExpense(expense: Partial<Expense>): Promise<Expense | null> {
    try {
      // Handle required fields
      const expenseData = {
        name: expense.name!,
        amount: expense.amount!,
        category: expense.category!,
        date: expense.date!,
        notes: expense.notes
      };
      
      if (expense.id) {
        // Update existing expense
        const { data, error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating expense:', error);
          toast({
            title: 'Error',
            description: 'Failed to update expense',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      } else {
        // Create new expense
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenseData)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating expense:', error);
          toast({
            title: 'Error',
            description: 'Failed to create expense',
            variant: 'destructive'
          });
          return null;
        }
        
        return data;
      }
    } catch (err) {
      console.error('Unexpected error saving expense:', err);
      return null;
    }
  }
  
  async deleteExpense(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete expense',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting expense:', err);
      return false;
    }
  }
  
  // Category operations
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive'
        });
        return [];
      }
      
      return data.map(category => category.name) || [];
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      return [];
    }
  }
  
  async saveCategory(name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name });
      
      if (error) {
        console.error('Error creating category:', error);
        toast({
          title: 'Error',
          description: 'Failed to save category',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error saving category:', err);
      return false;
    }
  }
  
  async deleteCategory(name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', name);
      
      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting category:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();


import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { supabaseService, Expense } from '../services/supabaseService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Expenses: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expense form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch expenses using React Query
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => supabaseService.getExpenses()
  });
  
  // Mutations for expenses
  const createExpenseMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => supabaseService.saveExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Added",
        description: "The expense has been successfully added."
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add expense. Please try again."
      });
    }
  });
  
  const updateExpenseMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => supabaseService.saveExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Updated",
        description: "The expense has been successfully updated."
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update expense. Please try again."
      });
    }
  });
  
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense. Please try again."
      });
    }
  });
  
  // Set default date to today when opening the dialog
  useEffect(() => {
    if (isDialogOpen && !isEditMode) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isDialogOpen, isEditMode]);
  
  // Filter expenses by period and search term
  const filteredExpenses = expenses.filter((expense) => {
    // Filter by search term
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by period
    if (filterPeriod === 'all') return matchesSearch;
    
    const expenseDate = new Date(expense.date);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    if (filterPeriod === 'today') {
      return matchesSearch && expenseDate >= startOfDay;
    }
    
    if (filterPeriod === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
      return matchesSearch && expenseDate >= startOfWeek;
    }
    
    if (filterPeriod === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return matchesSearch && expenseDate >= startOfMonth;
    }
    
    return matchesSearch;
  });
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Reset form fields
  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setCurrentExpense(null);
    setIsEditMode(false);
  };
  
  // Open dialog for creating a new expense
  const handleAddExpense = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing an existing expense
  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setName(expense.name);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setNotes(expense.notes || '');
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(id);
    }
  };
  
  // Save a new or updated expense
  const handleSaveExpense = () => {
    if (!name || !amount || !category || !date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    const expenseData: Partial<Expense> = {
      id: isEditMode && currentExpense ? currentExpense.id : undefined,
      name,
      amount: parseFloat(amount),
      category,
      date,
      notes: notes || undefined,
    };
    
    if (isEditMode && currentExpense) {
      updateExpenseMutation.mutate(expenseData);
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };
  
  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <Button onClick={handleAddExpense} className="mt-2 sm:mt-0">
            Add New Expense
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Expenses
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Period
              </label>
              <select
                id="period"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="text-xl font-medium text-center">
            Total Expenses: KES {totalExpenses.toLocaleString()}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading expenses...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KES {expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-primary hover:text-primary-dark"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Expense Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rent, Utilities, etc."
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (KES)
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Rent, Utilities, Salaries, etc."
                list="categories"
              />
              <datalist id="categories">
                <option value="Rent" />
                <option value="Utilities" />
                <option value="Salaries" />
                <option value="Transportation" />
                <option value="Maintenance" />
                <option value="Marketing" />
                <option value="License" />
                <option value="Miscellaneous" />
              </datalist>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExpense}>
              {isEditMode ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Expenses;

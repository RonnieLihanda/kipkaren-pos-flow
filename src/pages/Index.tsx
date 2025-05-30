
import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from '@/services/supabaseService';
import { RoleLabel } from '@/components/RoleLabel';
import { MigrateDataButton } from '@/components/MigrateDataButton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Index: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch data using React Query with shorter staleTime for more frequent updates
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => supabaseService.getProducts(),
    staleTime: 30000 // 30 seconds
  });
  
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => supabaseService.getSales(),
    staleTime: 30000
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => supabaseService.getExpenses(),
    staleTime: 30000
  });
  
  // Filter for today's sales
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const todaySales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    return saleDate === today;
  });
  
  // Filter for today's expenses
  const todayExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date).toISOString().split('T')[0];
    return expenseDate === today;
  });
  
  // Calculate sales total
  const salesTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate today's expenses total
  const expensesTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate today's profit
  const todayProfit = todaySales.reduce((profit, sale) => {
    // For each sale, we would need to fetch the sale items and calculate profit
    // This is a simplified approximation assuming 30% profit margin
    return profit + (sale.total * 0.3);
  }, 0);
  
  // Find low stock products
  const lowStockProducts = products.filter((product) => product.quantity <= product.reorder_level);
  
  // Function to refresh all data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <div className="flex items-center">
              <span className="mr-2">Welcome, {currentUser?.name}</span>
              <RoleLabel role={currentUser?.app_role || 'cashier'} />
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="mb-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-lg font-medium mb-2">Admin Tools</h2>
              <MigrateDataButton />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-lg font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSales ? (
                <div className="animate-pulse h-8 bg-gray-100 rounded"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold">KES {salesTotal.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{todaySales.length} transactions</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-secondary/5 pb-2">
              <CardTitle className="text-lg font-medium">Today's Profit</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSales ? (
                <div className="animate-pulse h-8 bg-gray-100 rounded"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold">KES {todayProfit.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Gross profit</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-red-50 pb-2">
              <CardTitle className="text-lg font-medium">Today's Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingExpenses ? (
                <div className="animate-pulse h-8 bg-gray-100 rounded"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold">KES {expensesTotal.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{todayExpenses.length} expense entries</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-accent/5 pb-2">
              <CardTitle className="text-lg font-medium">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingProducts ? (
                <div className="animate-pulse h-8 bg-gray-100 rounded"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold">{lowStockProducts.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Products below reorder level</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {lowStockProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Products Below Reorder Level</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.reorder_level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {todaySales.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Recent Sales</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaySales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KES {sale.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.staff_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.payment_method === 'mpesa' ? 'bg-green-100 text-green-800' : 
                          sale.payment_method === 'cash' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.payment_method.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {todayExpenses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Today's Expenses</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
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
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayExpenses.slice(0, 5).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KES {expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;

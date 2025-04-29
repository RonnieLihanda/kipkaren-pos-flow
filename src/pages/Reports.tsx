
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { localStorageService, Sale, Expense, Product } from '../services/localStorage';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('week');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Report summary data
  const [totalSales, setTotalSales] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState<any>({});
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  
  const { isAdmin } = useAuth();
  
  // Load data on component mount
  useEffect(() => {
    const loadedSales = localStorageService.getSales();
    const loadedExpenses = localStorageService.getExpenses();
    const loadedProducts = localStorageService.getProducts();
    
    setSales(loadedSales);
    setExpenses(loadedExpenses);
    setProducts(loadedProducts);
    
    // Find low stock products
    const lowStock = loadedProducts.filter((product) => product.quantity <= product.reorderLevel);
    setLowStockProducts(lowStock);
  }, []);
  
  // Generate report data when report type or date range changes
  useEffect(() => {
    generateReportData();
  }, [reportType, dateRange, sales, expenses, products]);
  
  // Get filtered data based on date range
  const getFilteredData = (data: any[]) => {
    const today = new Date();
    const startDate = new Date();
    
    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (dateRange === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return data.filter((item) => new Date(item.date || item.createdAt) >= startDate);
  };
  
  // Generate report data based on selected options
  const generateReportData = () => {
    const filteredSales = getFilteredData(sales);
    const filteredExpenses = getFilteredData(expenses);
    
    // Calculate totals
    const salesTotal = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const expensesTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    setTotalSales(salesTotal);
    setTotalExpenses(expensesTotal);
    setTotalProfit(salesTotal - expensesTotal);
    
    // Analyze payment methods
    const paymentMethods: any = {
      cash: 0,
      mpesa: 0,
      credit: 0
    };
    
    filteredSales.forEach((sale) => {
      paymentMethods[sale.paymentMethod] += sale.total;
    });
    
    setPaymentMethodBreakdown(paymentMethods);
    
    // Find top selling products
    const productSales: any = {};
    
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].total += item.total;
        } else {
          productSales[item.productId] = {
            id: item.productId,
            name: item.productName,
            quantity: item.quantity,
            total: item.total
          };
        }
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setTopSellingProducts(topProducts);
    
    // Generate chart data
    if (reportType === 'sales') {
      generateSalesChartData(filteredSales);
    } else if (reportType === 'expenses') {
      generateExpensesChartData(filteredExpenses);
    } else if (reportType === 'inventory') {
      generateInventoryChartData();
    } else if (reportType === 'profit') {
      generateProfitChartData(filteredSales, filteredExpenses);
    }
  };
  
  // Generate sales chart data
  const generateSalesChartData = (filteredSales: Sale[]) => {
    const salesByDay: any = {};
    
    filteredSales.forEach((sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      
      if (salesByDay[date]) {
        salesByDay[date] += sale.total;
      } else {
        salesByDay[date] = sale.total;
      }
    });
    
    const data = Object.keys(salesByDay).map((date) => ({
      name: date,
      value: salesByDay[date]
    }));
    
    setChartData(data);
  };
  
  // Generate expenses chart data
  const generateExpensesChartData = (filteredExpenses: Expense[]) => {
    const expensesByCategory: any = {};
    
    filteredExpenses.forEach((expense) => {
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += expense.amount;
      } else {
        expensesByCategory[expense.category] = expense.amount;
      }
    });
    
    const data = Object.keys(expensesByCategory).map((category) => ({
      name: category,
      value: expensesByCategory[category]
    }));
    
    setChartData(data);
  };
  
  // Generate inventory chart data
  const generateInventoryChartData = () => {
    const productsByCategory: any = {};
    
    products.forEach((product) => {
      if (productsByCategory[product.category]) {
        productsByCategory[product.category] += product.quantity;
      } else {
        productsByCategory[product.category] = product.quantity;
      }
    });
    
    const data = Object.keys(productsByCategory).map((category) => ({
      name: category,
      value: productsByCategory[category]
    }));
    
    setChartData(data);
  };
  
  // Generate profit chart data
  const generateProfitChartData = (filteredSales: Sale[], filteredExpenses: Expense[]) => {
    const profitByDay: any = {};
    const expensesByDay: any = {};
    
    // Group expenses by day
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      
      if (expensesByDay[date]) {
        expensesByDay[date] += expense.amount;
      } else {
        expensesByDay[date] = expense.amount;
      }
    });
    
    // Calculate profits by day
    filteredSales.forEach((sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      
      if (profitByDay[date]) {
        profitByDay[date] += sale.total;
      } else {
        profitByDay[date] = sale.total;
      }
      
      // Subtract expenses for that day
      if (expensesByDay[date]) {
        profitByDay[date] -= expensesByDay[date];
      }
    });
    
    const data = Object.keys(profitByDay).map((date) => ({
      name: date,
      value: profitByDay[date]
    }));
    
    setChartData(data);
  };
  
  // Function to export data to CSV
  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';
    
    if (reportType === 'sales') {
      // Export sales data
      csvContent = 'Date,Total,Payment Method,Items\n';
      
      const filteredSales = getFilteredData(sales);
      filteredSales.forEach((sale) => {
        const date = new Date(sale.createdAt).toLocaleDateString();
        const paymentMethod = sale.paymentMethod.toUpperCase();
        const itemsCount = sale.items.length;
        
        csvContent += `${date},${sale.total},${paymentMethod},${itemsCount}\n`;
      });
      
      filename = `sales_report_${new Date().toLocaleDateString()}.csv`;
    } else if (reportType === 'expenses') {
      // Export expenses data
      csvContent = 'Date,Name,Category,Amount\n';
      
      const filteredExpenses = getFilteredData(expenses);
      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date).toLocaleDateString();
        
        csvContent += `${date},${expense.name},${expense.category},${expense.amount}\n`;
      });
      
      filename = `expenses_report_${new Date().toLocaleDateString()}.csv`;
    } else if (reportType === 'inventory') {
      // Export inventory data
      csvContent = 'Name,SKU,Category,Quantity,Buying Price,Selling Price,Reorder Level\n';
      
      products.forEach((product) => {
        csvContent += `${product.name},${product.sku},${product.category},${product.quantity},${product.buyingPrice},${product.sellingPrice},${product.reorderLevel}\n`;
      });
      
      filename = `inventory_report_${new Date().toLocaleDateString()}.csv`;
    } else if (reportType === 'profit') {
      // Export profit data
      csvContent = 'Period,Sales,Expenses,Profit\n';
      csvContent += `${dateRange},${totalSales},${totalExpenses},${totalProfit}\n`;
      
      filename = `profit_report_${new Date().toLocaleDateString()}.csv`;
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-2xl font-bold">Reports</h1>
          <Button onClick={exportToCSV}>
            Export to CSV
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                id="reportType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sales">Sales Report</option>
                <option value="expenses">Expense Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="profit">Profit Report</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="dateRange"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">KES {totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-secondary/5 pb-2">
              <CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">KES {totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={`${totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'} pb-2`}>
              <CardTitle className="text-lg font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KES {totalProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">
            {reportType === 'sales' ? 'Sales Trend' : 
             reportType === 'expenses' ? 'Expenses by Category' : 
             reportType === 'inventory' ? 'Inventory by Category' : 'Profit Trend'}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill={
                    reportType === 'sales' ? '#6E59A5' : 
                    reportType === 'expenses' ? '#F97316' : 
                    reportType === 'inventory' ? '#0EA5E9' : 
                    '#10B981'
                  } 
                  name={
                    reportType === 'sales' ? 'Sales' : 
                    reportType === 'expenses' ? 'Expenses' : 
                    reportType === 'inventory' ? 'Stock Level' : 'Profit'
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Payment Method Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Cash</span>
                <span className="font-medium">KES {paymentMethodBreakdown.cash?.toLocaleString() || '0'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${totalSales ? (paymentMethodBreakdown.cash / totalSales) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>M-Pesa</span>
                <span className="font-medium">KES {paymentMethodBreakdown.mpesa?.toLocaleString() || '0'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${totalSales ? (paymentMethodBreakdown.mpesa / totalSales) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Credit</span>
                <span className="font-medium">KES {paymentMethodBreakdown.credit?.toLocaleString() || '0'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${totalSales ? (paymentMethodBreakdown.credit / totalSales) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Top Selling Products</h2>
            {topSellingProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No sales data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSellingProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          KES {product.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Low Stock Alert</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {product.reorderLevel}
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

export default Reports;

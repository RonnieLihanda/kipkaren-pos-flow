
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { localStorageService, Product, Sale } from '../services/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);

  useEffect(() => {
    // Load today's sales
    const sales = localStorageService.getSales();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      return saleDate === today;
    });
    
    setTodaySales(filteredSales);
    
    const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    setSalesTotal(total);
    
    // Calculate today's profit
    let profit = 0;
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = localStorageService.getProductById(item.productId);
        if (product) {
          const itemProfit = (product.sellingPrice - product.buyingPrice) * item.quantity;
          profit += itemProfit;
        }
      });
    });
    setTodayProfit(profit);
    
    // Load low stock products
    const products = localStorageService.getProducts();
    const lowStock = products.filter((product) => product.quantity <= product.reorderLevel);
    setLowStockProducts(lowStock);
  }, []);

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-lg font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">KES {salesTotal.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{todaySales.length} transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-secondary/5 pb-2">
              <CardTitle className="text-lg font-medium">Today's Profit</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">KES {todayProfit.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Gross profit</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-accent/5 pb-2">
              <CardTitle className="text-lg font-medium">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">{lowStockProducts.length}</p>
              <p className="text-sm text-gray-500 mt-1">Products below reorder level</p>
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
                      Supplier
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
                        {product.reorderLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.supplier}
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
                      Items
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
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        KES {sale.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.paymentMethod === 'mpesa' ? 'bg-green-100 text-green-800' : 
                          sale.paymentMethod === 'cash' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.paymentMethod.toUpperCase()}
                        </span>
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

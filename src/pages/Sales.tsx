
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { localStorageService, Product, SaleItem, Sale } from '../services/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [mpesaReference, setMpesaReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { currentUser } = useAuth();
  
  // Load products on component mount
  useEffect(() => {
    const loadedProducts = localStorageService.getProducts();
    setProducts(loadedProducts);
  }, []);
  
  // Calculate total amount when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    setTotalAmount(total);
  }, [cart]);
  
  // Filter products based on search term
  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add product to cart
  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is out of stock."
      });
      return;
    }
    
    const existingItem = cart.find((item) => item.productId === product.id);
    
    if (existingItem) {
      // Check if adding one more would exceed available quantity
      if (existingItem.quantity + 1 > product.quantity) {
        toast({
          variant: "destructive",
          title: "Insufficient Stock",
          description: `Only ${product.quantity} units available.`
        });
        return;
      }
      
      const updatedCart = cart.map((item) => {
        if (item.productId === product.id) {
          const newQuantity = item.quantity + 1;
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * product.sellingPrice,
          };
        }
        return item;
      });
      
      setCart(updatedCart);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice,
      };
      
      setCart([...cart, newItem]);
    }
    
    // Clear search after adding to cart
    setSearchTerm('');
  };
  
  // Update cart item quantity
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    
    if (!product) return;
    
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    if (newQuantity > product.quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available.`
      });
      return;
    }
    
    const updatedCart = cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price,
        };
      }
      return item;
    });
    
    setCart(updatedCart);
  };
  
  // Remove item from cart
  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
  };
  
  // Clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };
  
  // Open checkout dialog
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to the cart before checkout."
      });
      return;
    }
    
    setCheckoutDialogOpen(true);
  };
  
  // Complete the sale
  const handleCompleteSale = () => {
    if (paymentMethod === 'mpesa' && !mpesaReference) {
      toast({
        variant: "destructive",
        title: "M-Pesa Reference Required",
        description: "Please enter the M-Pesa reference number."
      });
      return;
    }
    
    if (paymentMethod === 'credit' && !customerName) {
      toast({
        variant: "destructive",
        title: "Customer Name Required",
        description: "Please enter the customer name for credit sale."
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create the sale
      const sale: Sale = {
        id: Date.now().toString(),
        items: [...cart],
        total: totalAmount,
        paymentMethod,
        staffId: currentUser?.id || '',
        staffName: currentUser?.name || '',
        customerName: customerName || undefined,
        reference: mpesaReference || undefined,
        createdAt: new Date().toISOString(),
      };
      
      // Save the sale
      localStorageService.saveSale(sale);
      
      // Update product quantities
      localStorageService.updateProductQuantities(cart);
      
      // Reload products to reflect updated quantities
      setProducts(localStorageService.getProducts());
      
      // Clear the cart and reset fields
      setCart([]);
      setPaymentMethod('cash');
      setMpesaReference('');
      setCustomerName('');
      
      toast({
        title: "Sale Complete",
        description: "The sale has been successfully processed."
      });
      
      // Generate receipt
      generateReceipt(sale);
    } catch (error) {
      console.error('Error completing sale:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the sale. Please try again."
      });
    } finally {
      setIsProcessing(false);
      setCheckoutDialogOpen(false);
    }
  };
  
  // Generate receipt (this would be expanded in a real app)
  const generateReceipt = (sale: Sale) => {
    // For now, just showing a success message
    // In a real app, this would generate a printable receipt
    console.log('Receipt generated for sale:', sale);
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Sales</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search and List */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            KES {product.sellingPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.quantity <= product.reorderLevel
                                ? product.quantity === 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              size="sm"
                              disabled={product.quantity <= 0}
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {searchTerm && filteredProducts.length === 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded text-center text-gray-500">
                No products found matching "{searchTerm}"
              </div>
            )}
            
            {!searchTerm && (
              <div className="p-8 text-center text-gray-500">
                Search for products to add to cart
              </div>
            )}
          </div>
          
          {/* Shopping Cart */}
          <div className="col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Cart</h2>
              <p className="text-sm text-gray-500">{cart.length} items</p>
            </div>
            
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Your cart is empty
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          KES {item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-2 py-1">{item.quantity}</span>
                          <button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold">KES {totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Checkout
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
              <p className="text-sm text-gray-500">{cart.length} items, KES {totalAmount.toLocaleString()}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                      paymentMethod === 'cash'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    Cash
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                      paymentMethod === 'mpesa'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setPaymentMethod('mpesa')}
                  >
                    M-Pesa
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${
                      paymentMethod === 'credit'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setPaymentMethod('credit')}
                  >
                    Credit
                  </button>
                </div>
              </div>
              
              {paymentMethod === 'mpesa' && (
                <div>
                  <label htmlFor="mpesaReference" className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Reference Number
                  </label>
                  <Input
                    id="mpesaReference"
                    value={mpesaReference}
                    onChange={(e) => setMpesaReference(e.target.value)}
                    placeholder="Enter M-Pesa transaction code"
                  />
                </div>
              )}
              
              {paymentMethod === 'credit' && (
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSale} 
              disabled={isProcessing}
              className={`${
                paymentMethod === 'mpesa' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : paymentMethod === 'credit'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Sales;

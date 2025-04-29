
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { localStorageService, Supplier, Delivery, DeliveryItem, Product } from '../services/localStorage';
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

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Supplier form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  // Delivery form state
  const [selectedProducts, setSelectedProducts] = useState<DeliveryItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [deliveryQuantity, setDeliveryQuantity] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  
  const { isAdmin } = useAuth();
  
  // Load suppliers and products on component mount
  useEffect(() => {
    const loadedSuppliers = localStorageService.getSuppliers();
    setSuppliers(loadedSuppliers);
    
    const loadedProducts = localStorageService.getProducts();
    setAllProducts(loadedProducts);
  }, []);
  
  // Calculate delivery total when selected products change
  useEffect(() => {
    const total = selectedProducts.reduce((sum, item) => sum + item.cost, 0);
    setDeliveryTotal(total);
  }, [selectedProducts]);
  
  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );
  
  // Reset supplier form fields
  const resetSupplierForm = () => {
    setName('');
    setPhone('');
    setCompany('');
    setCurrentSupplier(null);
    setIsEditMode(false);
  };
  
  // Reset delivery form fields
  const resetDeliveryForm = () => {
    setSelectedProducts([]);
    setSelectedProductId('');
    setDeliveryQuantity('');
    setDeliveryCost('');
    setDeliveryNotes('');
  };
  
  // Open dialog for creating a new supplier
  const handleAddSupplier = () => {
    resetSupplierForm();
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing an existing supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone);
    setCompany(supplier.company);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Delete a supplier
  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      localStorageService.deleteSupplier(id);
      setSuppliers(localStorageService.getSuppliers());
      toast({
        title: "Supplier Deleted",
        description: "The supplier has been successfully deleted."
      });
    }
  };
  
  // Save a new or updated supplier
  const handleSaveSupplier = () => {
    if (!name || !phone || !company) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields."
      });
      return;
    }
    
    const supplierData: Supplier = {
      id: isEditMode && currentSupplier ? currentSupplier.id : Date.now().toString(),
      name,
      phone,
      company,
      createdAt: isEditMode && currentSupplier ? currentSupplier.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorageService.saveSupplier(supplierData);
    setSuppliers(localStorageService.getSuppliers());
    
    setIsDialogOpen(false);
    resetSupplierForm();
    
    toast({
      title: isEditMode ? "Supplier Updated" : "Supplier Added",
      description: isEditMode 
        ? "The supplier has been successfully updated." 
        : "The supplier has been successfully added."
    });
  };
  
  // Open delivery dialog for a supplier
  const handleAddDelivery = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    resetDeliveryForm();
    setIsDeliveryDialogOpen(true);
  };
  
  // Add product to delivery
  const handleAddProductToDelivery = () => {
    if (!selectedProductId || !deliveryQuantity || !deliveryCost) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a product and enter quantity and cost."
      });
      return;
    }
    
    const product = allProducts.find((p) => p.id === selectedProductId);
    if (!product) return;
    
    const quantity = parseInt(deliveryQuantity);
    const cost = parseFloat(deliveryCost);
    
    if (quantity <= 0 || cost <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Quantity and cost must be greater than zero."
      });
      return;
    }
    
    const newItem: DeliveryItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      cost,
    };
    
    // Check if product already exists in selected products
    const existingIndex = selectedProducts.findIndex((item) => item.productId === product.id);
    
    if (existingIndex !== -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        quantity: updatedProducts[existingIndex].quantity + quantity,
        cost: updatedProducts[existingIndex].cost + cost,
      };
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([...selectedProducts, newItem]);
    }
    
    // Reset product selection fields
    setSelectedProductId('');
    setDeliveryQuantity('');
    setDeliveryCost('');
  };
  
  // Remove product from delivery
  const handleRemoveProductFromDelivery = (productId: string) => {
    const updatedProducts = selectedProducts.filter((item) => item.productId !== productId);
    setSelectedProducts(updatedProducts);
  };
  
  // Save delivery
  const handleSaveDelivery = () => {
    if (!currentSupplier) return;
    
    if (selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add at least one product to the delivery."
      });
      return;
    }
    
    const deliveryData: Delivery = {
      id: Date.now().toString(),
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.name,
      date: new Date().toISOString(),
      items: [...selectedProducts],
      cost: deliveryTotal,
      notes: deliveryNotes || undefined,
    };
    
    try {
      // Save the delivery
      localStorageService.saveDelivery(deliveryData);
      
      // Update product quantities
      localStorageService.updateProductQuantitiesFromDelivery(selectedProducts);
      
      // Reload products to reflect updated quantities
      setAllProducts(localStorageService.getProducts());
      
      setIsDeliveryDialogOpen(false);
      resetDeliveryForm();
      
      toast({
        title: "Delivery Added",
        description: "The delivery has been successfully recorded."
      });
    } catch (error) {
      console.error('Error saving delivery:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the delivery. Please try again."
      });
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
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <Button onClick={handleAddSupplier} className="mt-2 sm:mt-0">
            Add New Supplier
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Suppliers
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name, company or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleAddDelivery(supplier)}
                          className="text-accent hover:text-accent-dark"
                        >
                          Add Delivery
                        </button>
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
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
      </div>

      {/* Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0700123456"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier}>
              {isEditMode ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Delivery from {currentSupplier?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  id="product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  type="number"
                  value={deliveryQuantity}
                  onChange={(e) => setDeliveryQuantity(e.target.value)}
                  placeholder="Quantity"
                />
              </div>
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (KES)
                </label>
                <Input
                  id="cost"
                  type="number"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(e.target.value)}
                  placeholder="Cost"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddProductToDelivery} className="w-full">
                  Add Product
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Products in Delivery</h3>
              {selectedProducts.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">
                  No products added yet
                </div>
              ) : (
                <div className="bg-gray-50 p-2 rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Cost</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedProducts.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-3 py-2 text-sm text-gray-800">{item.productName}</td>
                          <td className="px-3 py-2 text-sm text-gray-800">{item.quantity}</td>
                          <td className="px-3 py-2 text-sm text-gray-800">
                            KES {item.cost.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              className="text-red-500 hover:text-red-700 text-sm"
                              onClick={() => handleRemoveProductFromDelivery(item.productId)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Any additional notes"
                rows={3}
              />
            </div>
            
            <div className="flex justify-between font-medium">
              <span>Total Cost:</span>
              <span>KES {deliveryTotal.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDelivery} disabled={selectedProducts.length === 0}>
              Save Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Suppliers;

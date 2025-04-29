
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { localStorageService, Product } from '../services/localStorage';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  const { isAdmin } = useAuth();
  
  // New product form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  
  // Load products and categories on component mount
  useEffect(() => {
    const loadedProducts = localStorageService.getProducts();
    setProducts(loadedProducts);
    
    const loadedCategories = localStorageService.getCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Function to filter products by search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Reset form fields
  const resetForm = () => {
    setName('');
    setCategory('');
    setSku('');
    setBuyingPrice('');
    setSellingPrice('');
    setQuantity('');
    setSupplier('');
    setReorderLevel('');
    setCurrentProduct(null);
    setIsEditMode(false);
  };
  
  // Open dialog for creating a new product
  const handleAddProduct = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing an existing product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setName(product.name);
    setCategory(product.category);
    setSku(product.sku);
    setBuyingPrice(product.buyingPrice.toString());
    setSellingPrice(product.sellingPrice.toString());
    setQuantity(product.quantity.toString());
    setSupplier(product.supplier);
    setReorderLevel(product.reorderLevel.toString());
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Delete a product
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      localStorageService.deleteProduct(id);
      setProducts(localStorageService.getProducts());
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted."
      });
    }
  };
  
  // Save a new or updated product
  const handleSaveProduct = () => {
    if (!name || !category || !sku || !buyingPrice || !sellingPrice || !quantity || !supplier || !reorderLevel) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields."
      });
      return;
    }
    
    const productData: Product = {
      id: isEditMode && currentProduct ? currentProduct.id : Date.now().toString(),
      name,
      category,
      sku,
      buyingPrice: parseFloat(buyingPrice),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity),
      supplier,
      reorderLevel: parseInt(reorderLevel),
      createdAt: isEditMode && currentProduct ? currentProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorageService.saveProduct(productData);
    setProducts(localStorageService.getProducts());
    
    // Add category if it doesn't exist
    if (!categories.includes(category)) {
      localStorageService.saveCategory(category);
      setCategories(localStorageService.getCategories());
    }
    
    setIsDialogOpen(false);
    resetForm();
    
    toast({
      title: isEditMode ? "Product Updated" : "Product Added",
      description: isEditMode 
        ? "The product has been successfully updated." 
        : "The product has been successfully added."
    });
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory</h1>
          {isAdmin && (
            <Button onClick={handleAddProduct} className="mt-2 sm:mt-0">
              Add New Product
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  {isAdmin && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buying Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                    </>
                  )}
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium`} 
                          style={{backgroundColor: `var(--category-${product.category.toLowerCase()})` || '#F1F0FB'}}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
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
                      {isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            KES {product.buyingPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.supplier}
                          </td>
                        </>
                      )}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-primary hover:text-primary-dark"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Name"
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
                  placeholder="Category"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                />
              </div>
              
              <div>
                <label htmlFor="buyingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Buying Price (KES)
                </label>
                <Input
                  id="buyingPrice"
                  type="number"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(e.target.value)}
                  placeholder="Buying Price"
                />
              </div>
              
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (KES)
                </label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="Selling Price"
                />
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity in Stock
                </label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                />
              </div>
              
              <div>
                <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  placeholder="Reorder Level"
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              {isEditMode ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Inventory;

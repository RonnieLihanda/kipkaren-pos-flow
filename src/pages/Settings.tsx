
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { localStorageService, User } from '../services/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier'
  });
  const [storeInfo, setStoreInfo] = useState({
    name: 'Mic3 Hardware Store',
    phone: '+254111406123',
    address: 'Eldoret-Webuye Highway, Kipkaren River',
    owner: 'Ronnie'
  });
  const [exportData, setExportData] = useState('');
  
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    if (isAdmin) {
      const loadedUsers = localStorageService.getUsers();
      setUsers(loadedUsers);
    }
    
    // Load store info from localStorage if exists
    const savedStoreInfo = localStorage.getItem('pos_store_info');
    if (savedStoreInfo) {
      setStoreInfo(JSON.parse(savedStoreInfo));
    }
  }, [isAdmin]);
  
  // Handle user form input changes
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };
  
  // Handle store info form input changes
  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreInfo({
      ...storeInfo,
      [name]: value
    });
  };
  
  // Add new user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all fields."
      });
      return;
    }
    
    // Check if email already exists
    const existingUser = users.find((user) => user.email === newUser.email);
    if (existingUser) {
      toast({
        variant: "destructive",
        title: "Email Already Exists",
        description: "A user with this email already exists."
      });
      return;
    }
    
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role
    };
    
    localStorageService.saveUser(user);
    setUsers(localStorageService.getUsers());
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'cashier'
    });
    
    toast({
      title: "User Added",
      description: "The user has been successfully added."
    });
  };
  
  // Delete user
  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete User",
        description: "You must have at least one user in the system."
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter((user) => user.id !== id);
      localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted."
      });
    }
  };
  
  // Save store info
  const handleSaveStoreInfo = () => {
    localStorage.setItem('pos_store_info', JSON.stringify(storeInfo));
    toast({
      title: "Settings Saved",
      description: "Store information has been successfully updated."
    });
  };
  
  // Export all data
  const handleExportData = () => {
    const data = {
      users: localStorageService.getUsers(),
      products: localStorageService.getProducts(),
      suppliers: localStorageService.getSuppliers(),
      sales: localStorageService.getSales(),
      expenses: localStorageService.getExpenses(),
      deliveries: localStorageService.getDeliveries(),
      categories: localStorageService.getCategories(),
      storeInfo
    };
    
    setExportData(JSON.stringify(data));
    
    toast({
      title: "Data Exported",
      description: "Copy the JSON data for backup."
    });
  };
  
  // Import data
  const handleImportData = () => {
    if (!exportData) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please paste your backup data."
      });
      return;
    }
    
    try {
      const data = JSON.parse(exportData);
      
      // Validate data structure
      if (!data.users || !data.products || !data.suppliers || !data.sales || !data.expenses) {
        throw new Error("Invalid data format.");
      }
      
      // Confirm before overwriting
      if (window.confirm('This will overwrite ALL existing data. Are you sure?')) {
        // Save data to localStorage
        localStorage.setItem('pos_users', JSON.stringify(data.users));
        localStorage.setItem('pos_products', JSON.stringify(data.products));
        localStorage.setItem('pos_suppliers', JSON.stringify(data.suppliers));
        localStorage.setItem('pos_sales', JSON.stringify(data.sales));
        localStorage.setItem('pos_expenses', JSON.stringify(data.expenses));
        localStorage.setItem('pos_deliveries', JSON.stringify(data.deliveries || []));
        localStorage.setItem('pos_categories', JSON.stringify(data.categories || []));
        localStorage.setItem('pos_store_info', JSON.stringify(data.storeInfo || storeInfo));
        
        toast({
          title: "Data Imported",
          description: "All data has been successfully restored."
        });
        
        // Reload page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "The data format is invalid. Please check your backup data."
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
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="store">
          <TabsList className="mb-6">
            <TabsTrigger value="store">Store Information</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>
          
          {/* Store Information Tab */}
          <TabsContent value="store">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Store Information</h2>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={storeInfo.name}
                      onChange={handleStoreInfoChange}
                      placeholder="Store Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={storeInfo.phone}
                      onChange={handleStoreInfoChange}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={storeInfo.address}
                    onChange={handleStoreInfoChange}
                    placeholder="Store Address"
                  />
                </div>
                
                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <Input
                    id="owner"
                    name="owner"
                    value={storeInfo.owner}
                    onChange={handleStoreInfoChange}
                    placeholder="Owner Name"
                  />
                </div>
                
                <div className="mt-4">
                  <Button onClick={handleSaveStoreInfo}>Save Information</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">User Management</h2>
                </div>
                <div className="p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Add New User</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleUserInputChange}
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleUserInputChange}
                      placeholder="Email Address"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newUser.password}
                      onChange={handleUserInputChange}
                      placeholder="Password"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newUser.role}
                      onChange={handleUserInputChange}
                    >
                      <option value="cashier">Cashier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={handleAddUser}>Add User</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Backup & Restore Tab */}
          <TabsContent value="backup">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Backup & Restore</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Export Data Backup</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate a backup of all your data. Keep this in a safe place.
                  </p>
                  
                  <Button onClick={handleExportData} className="mb-4">Generate Backup</Button>
                  
                  {exportData && (
                    <div>
                      <label htmlFor="exportData" className="block text-sm font-medium text-gray-700 mb-1">
                        Backup Data (Copy this)
                      </label>
                      <textarea
                        id="exportData"
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={exportData}
                        readOnly
                      ></textarea>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Restore Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong className="text-red-600">Warning:</strong> This will overwrite all existing data. Make sure you have a backup of your current data before proceeding.
                  </p>
                  
                  <div>
                    <label htmlFor="importData" className="block text-sm font-medium text-gray-700 mb-1">
                      Paste Backup Data
                    </label>
                    <textarea
                      id="importData"
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={exportData}
                      onChange={(e) => setExportData(e.target.value)}
                      placeholder="Paste your backup data here..."
                    ></textarea>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="destructive" onClick={handleImportData}>
                      Restore Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;

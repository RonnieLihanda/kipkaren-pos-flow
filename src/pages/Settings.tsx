
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ProtectedPage } from '../components/ProtectedPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoleLabel } from '@/components/RoleLabel';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [storeInfo, setStoreInfo] = useState({
    name: 'Mic3 Hardware Store',
    phone: '+254111406123',
    address: 'Eldoret-Webuye Highway, Kipkaren River',
    owner: 'Ronnie'
  });
  const [exportData, setExportData] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier'
  });
  
  const { isAdmin, currentUser } = useAuth();
  
  // Fetch all users with their metadata
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      // Map users to the format we need
      return data.users.map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: user.user_metadata?.app_role || 'cashier',
      }));
    },
    enabled: isAdmin, // Only fetch if user is admin
  });
  
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
  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!newUser.name || !newUser.email || !newUser.password) {
        throw new Error("Please fill in all fields.");
      }
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: { 
          name: newUser.name,
          app_role: newUser.role
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
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
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add user",
        description: error.message || "An error occurred."
      });
    }
  });
  
  // Toggle user role
  const toggleRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Find the user
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      
      // Toggle the role
      const newRole = user.role === 'admin' ? 'cashier' : 'admin';
      
      // Update in Supabase
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { 
          name: user.name,
          app_role: newRole
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error.message || "An error occurred."
      });
    }
  });
  
  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: error.message || "An error occurred."
      });
    }
  });
  
  // Handle adding user
  const handleAddUser = () => {
    addUserMutation.mutate();
  };
  
  // Handle toggling user role
  const handleToggleUserRole = (id: string) => {
    // Don't allow changing your own role
    if (id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Cannot Change Your Own Role",
        description: "For security reasons, you cannot change your own role."
      });
      return;
    }
    
    toggleRoleMutation.mutate(id);
  };
  
  // Handle deleting user
  const handleDeleteUser = (id: string) => {
    // Don't allow deleting your own account
    if (id === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Cannot Delete Your Own Account",
        description: "For security reasons, you cannot delete your own account."
      });
      return;
    }
    
    if (users.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete User",
        description: "You must have at least one user in the system."
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
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
  const handleExportData = async () => {
    try {
      // Fetch all data from Supabase
      const [products, suppliers, sales, expenses, deliveries, categories] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('deliveries').select('*'),
        supabase.from('categories').select('*')
      ]);
      
      const data = {
        products: products.data || [],
        suppliers: suppliers.data || [],
        sales: sales.data || [],
        expenses: expenses.data || [],
        deliveries: deliveries.data || [],
        categories: categories.data || [],
        storeInfo
      };
      
      setExportData(JSON.stringify(data));
      
      toast({
        title: "Data Exported",
        description: "Copy the JSON data for backup."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export data."
      });
    }
  };
  
  // Load store info from localStorage on init
  useEffect(() => {
    const savedStoreInfo = localStorage.getItem('pos_store_info');
    if (savedStoreInfo) {
      setStoreInfo(JSON.parse(savedStoreInfo));
    }
  }, []);
  
  return (
    <ProtectedPage adminOnly={true} title="Settings">
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
                {isLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
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
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-gray-500">(You)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <RoleLabel 
                              role={user.role as 'admin' | 'cashier'} 
                              clickable={user.id !== currentUser?.id}
                              onRoleChange={() => handleToggleUserRole(user.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                  <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                    {addUserMutation.isPending ? 'Adding...' : 'Add User'}
                  </Button>
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ProtectedPage>
  );
};

export default Settings;

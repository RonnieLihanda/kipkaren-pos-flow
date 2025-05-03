
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { migrateData } from '@/utils/migrateData';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const MigrateDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  const handleMigration = async () => {
    setIsLoading(true);
    setIsDialogOpen(false);
    
    try {
      const success = await migrateData();
      
      if (success) {
        toast({
          title: 'Data Migration Successful',
          description: 'All data has been migrated to the Supabase database.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Migration Failed',
          description: 'An error occurred during migration. Please check console logs.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAdmin) return null;
  
  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)} 
        disabled={isLoading} 
        variant="outline"
        className="w-full"
      >
        {isLoading ? 'Migrating Data...' : 'Migrate Data from Local Storage to Database'}
      </Button>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Migrate Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will copy all data from localStorage to Supabase database. This operation cannot be undone. 
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMigration}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

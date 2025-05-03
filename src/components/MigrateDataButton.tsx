
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { migrateData } from '@/utils/migrateData';
import { toast } from '@/components/ui/use-toast';

export const MigrateDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleMigration = async () => {
    if (!confirm('This will copy all data from localStorage to Supabase database. Continue?')) {
      return;
    }
    
    setIsLoading(true);
    
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
  
  return (
    <Button 
      onClick={handleMigration} 
      disabled={isLoading} 
      variant="outline"
      className="w-full"
    >
      {isLoading ? 'Migrating Data...' : 'Migrate Data from Local Storage to Database'}
    </Button>
  );
};

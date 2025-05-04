
import React, { useState } from 'react';
import { Button } from './ui/button';
import { migrateData } from '@/utils/migrateData';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

export const MigrateDataButton: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigrate = async () => {
    try {
      setIsMigrating(true);
      const success = await migrateData();
      
      if (success) {
        toast({
          title: 'Migration Successful',
          description: 'All data has been successfully migrated to the database.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Migration Failed',
        description: 'An error occurred during migration.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button 
      onClick={handleMigrate} 
      disabled={isMigrating} 
      className="w-full py-6 text-base font-medium"
      variant="default"
    >
      {isMigrating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Migrating Data...
        </>
      ) : (
        'Migrate Data from Local Storage to Database'
      )}
    </Button>
  );
};

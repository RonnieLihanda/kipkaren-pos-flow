
import React from 'react';

interface RoleLabelProps {
  role: 'admin' | 'cashier';
  className?: string;
}

export const RoleLabel: React.FC<RoleLabelProps> = ({ role, className = '' }) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  
  const roleClasses = {
    admin: "bg-blue-100 text-blue-800",
    cashier: "bg-green-100 text-green-800"
  };
  
  return (
    <span className={`${baseClasses} ${roleClasses[role]} ${className}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};


import React from 'react';

interface RoleLabelProps {
  role: 'admin' | 'cashier';
  className?: string;
  onRoleChange?: () => void;
  clickable?: boolean;
}

export const RoleLabel: React.FC<RoleLabelProps> = ({ role, className = '', onRoleChange, clickable = false }) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  
  const roleClasses = {
    admin: "bg-blue-100 text-blue-800",
    cashier: "bg-green-100 text-green-800"
  };
  
  const clickableClasses = clickable ? "cursor-pointer hover:opacity-80" : "";
  
  return (
    <span 
      className={`${baseClasses} ${roleClasses[role]} ${className} ${clickableClasses}`} 
      onClick={clickable ? onRoleChange : undefined}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

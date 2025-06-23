
import React, { useState } from 'react';
import { RoleSelection } from '@/components/RoleSelection';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  if (!selectedRole || !selectedName) {
    return (
      <RoleSelection 
        onRoleSelect={(role, name) => {
          setSelectedRole(role);
          setSelectedName(name);
        }} 
      />
    );
  }

  return <Dashboard userRole={selectedRole} userName={selectedName} />;
};

export default Index;

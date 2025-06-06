
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { TaskManagement } from '@/components/admin/TaskManagement';
import { PlanningManagement } from '@/components/admin/PlanningManagement';
import { PeopleManagement } from '@/components/admin/PeopleManagement';
import { VendorManagement } from '@/components/admin/VendorManagement';
import { DocumentManagement } from '@/components/admin/DocumentManagement';
import { EventConfiguration } from '@/components/admin/EventConfiguration';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Jour J - Admin
              </h1>
              <p className="text-sm text-gray-600">Portail de gestion événementielle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex flex-col py-3">
              <span className="text-xs">📊</span>
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex flex-col py-3">
              <span className="text-xs">📋</span>
              <span className="text-xs">Tâches</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex flex-col py-3">
              <span className="text-xs">⏰</span>
              <span className="text-xs">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex flex-col py-3">
              <span className="text-xs">👥</span>
              <span className="text-xs">Personnes</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex flex-col py-3">
              <span className="text-xs">🏢</span>
              <span className="text-xs">Prestataires</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex flex-col py-3">
              <span className="text-xs">📁</span>
              <span className="text-xs">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex flex-col py-3">
              <span className="text-xs">⚙️</span>
              <span className="text-xs">Config</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="tasks">
              <TaskManagement />
            </TabsContent>
            <TabsContent value="planning">
              <PlanningManagement />
            </TabsContent>
            <TabsContent value="people">
              <PeopleManagement />
            </TabsContent>
            <TabsContent value="vendors">
              <VendorManagement />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentManagement />
            </TabsContent>
            <TabsContent value="config">
              <EventConfiguration />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;

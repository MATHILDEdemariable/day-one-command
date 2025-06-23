
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedPlanningManagement } from '@/components/admin/UnifiedPlanningManagement';
import { PeopleManagement } from '@/components/admin/PeopleManagement';
import { VendorManagement } from '@/components/admin/VendorManagement';
import { DocumentManagement } from '@/components/admin/DocumentManagement';
import { EventConfiguration } from '@/components/admin/EventConfiguration';
import { AdminBottomNavigation } from '@/components/admin/AdminBottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { useAdminProtectedRoute } from '@/hooks/useAdminProtectedRoute';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useEventData } from '@/contexts/EventDataContext';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('planning');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAdminAuth();
  const { showLoginModal, handleCloseLoginModal } = useAdminProtectedRoute();
  const { currentEvent } = useEventData();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'planning':
        return <UnifiedPlanningManagement />;
      case 'people':
        return <PeopleManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'documents':
        return <DocumentManagement />;
      case 'config':
        return <EventConfiguration />;
      default:
        return <UnifiedPlanningManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLoginModal isOpen={showLoginModal} onClose={handleCloseLoginModal} />

      {isAuthenticated && (
        <>
          {/* Header - Responsive */}
          <div className="bg-white border-b shadow-sm">
            <div className="flex items-center justify-between p-3 lg:p-4">
              <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/')}
                  className="text-gray-600 px-2 lg:px-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">{t('back')}</span>
                </Button>
                <div className="overflow-hidden">
                  <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                    {currentEvent ? `${currentEvent.name} - Admin` : 'Jour J - Admin'}
                  </h1>
                  {currentEvent && (
                    <p className="text-xs lg:text-sm text-gray-600 truncate">
                      {currentEvent.event_type} • {new Date(currentEvent.event_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                {!isMobile && <LanguageToggle />}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center gap-1 px-2 lg:px-3"
                >
                  <LogOut className="w-3 h-3" />
                  {!isMobile && t('logout')}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          {!isMobile && (
            <div className="bg-white border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                  <TabsTrigger value="planning" className="flex flex-col py-3">
                    <span className="text-xs">⏰</span>
                    <span className="text-xs">Planning & Tâches</span>
                  </TabsTrigger>
                  <TabsTrigger value="people" className="flex flex-col py-3">
                    <span className="text-xs">👥</span>
                    <span className="text-xs">{t('people')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="flex flex-col py-3">
                    <span className="text-xs">🏢</span>
                    <span className="text-xs">{t('vendors')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex flex-col py-3">
                    <span className="text-xs">📁</span>
                    <span className="text-xs">{t('documents')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="config" className="flex flex-col py-3">
                    <span className="text-xs">⚙️</span>
                    <span className="text-xs">{t('config')}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Content - Responsive */}
          <div className="p-3 lg:p-6 pb-20 lg:pb-6">
            {renderTabContent()}
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <AdminBottomNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminPortal;

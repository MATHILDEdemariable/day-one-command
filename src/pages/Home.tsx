
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { EventPortalSelectionModal } from '@/components/event/EventPortalSelectionModal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showEventPortalSelection, setShowEventPortalSelection] = useState(false);

  const handleLogin = async (password: string) => {
    const success = await login(password);
    if (success) {
      toast({
        title: "Connexion réussie",
        description: "Vous êtes connecté en tant qu'administrateur.",
      });
      setShowAdminLogin(false);
      navigate('/admin');
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Mot de passe incorrect.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous êtes déconnecté de l'administration.",
    });
  };

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleEventPortalAccess = () => {
    setShowEventPortalSelection(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-yellow-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-stone-800 mb-4 tracking-tight">
            Mariage de <span className="text-sage-600">Mathilde & Alain</span>
          </h1>
          <p className="text-stone-500 text-lg mb-8">
            Une appli, une équipe, une journée parfaite – powered by <span className="text-purple-600 font-semibold">Mariable</span>.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              onClick={handleEventPortalAccess}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Eye className="w-5 h-5" />
              Jour-J
            </Button>
            
            <Button
              onClick={handleAdminAccess}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-2"
              size="lg"
            >
              <Settings className="w-5 h-5" />
              Admin
            </Button>
          </div>

          {isAuthenticated && (
            <div className="mt-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-stone-500 hover:text-stone-700"
              >
                Se déconnecter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/69f2f20b-c47f-4c2c-8609-7e9151e83a4f.png" 
              alt="Mariable Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <div className="text-white text-sm">
            © 2025 - Powered by <a href="https://mariable.fr" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">mariable.fr</a>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion Administrateur</DialogTitle>
            <DialogDescription>
              Entrez le mot de passe pour accéder à l'interface d'administration.
            </DialogDescription>
          </DialogHeader>
          <AdminLoginForm onSubmit={handleLogin} />
        </DialogContent>
      </Dialog>

      {/* Event Portal Selection Modal */}
      <EventPortalSelectionModal
        open={showEventPortalSelection}
        onOpenChange={setShowEventPortalSelection}
      />
    </div>
  );
};

export default Home;

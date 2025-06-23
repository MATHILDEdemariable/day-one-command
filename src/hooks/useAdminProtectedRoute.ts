
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useAdminProtectedRoute = () => {
  const { isAuthenticated } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [isAuthenticated]);

  const handleCloseLoginModal = () => {
    if (!isAuthenticated) {
      // Rediriger vers la page d'accueil si l'utilisateur ferme le modal sans se connecter
      navigate('/');
    } else {
      setShowLoginModal(false);
    }
  };

  return { showLoginModal, handleCloseLoginModal };
};

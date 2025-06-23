
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Building2, ArrowRight } from 'lucide-react';
import { usePeople } from '@/hooks/usePeople';
import { useVendors } from '@/hooks/useVendors';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

interface EventPortalSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventPortalSelectionModal: React.FC<EventPortalSelectionModalProps> = ({
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const { currentEventId } = useCurrentEvent();
  const { people, loadPeople } = usePeople();
  const { vendors, loadVendors } = useVendors();
  
  const [teamType, setTeamType] = useState<'personal' | 'professional' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadPeople();
      loadVendors();
    }
  }, [open]);

  const handleTeamTypeSelect = (type: 'personal' | 'professional') => {
    setTeamType(type);
    setSelectedUserId('');
  };

  const handleContinue = () => {
    if (!selectedUserId || !teamType || !currentEventId) return;

    const userType = teamType === 'personal' ? 'person' : 'vendor';
    const url = `/event-portal?user_type=${userType}&user_id=${selectedUserId}`;
    
    navigate(url);
    onOpenChange(false);
    
    // Reset state
    setTeamType(null);
    setSelectedUserId('');
  };

  const handleBack = () => {
    setTeamType(null);
    setSelectedUserId('');
  };

  const filteredPeople = people.filter(person => person.event_id === currentEventId);
  const filteredVendors = vendors.filter(vendor => vendor.event_id === currentEventId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Accès Jour-J
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre profil pour accéder à votre planning personnalisé du jour J
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!teamType ? (
            // Step 1: Choose team type
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Choisissez votre équipe :</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleTeamTypeSelect('personal')}
                  className="h-auto p-4 justify-start border-purple-200 hover:bg-purple-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Équipe personnelle</div>
                      <div className="text-sm text-gray-500">
                        Personnes inscrites à l'événement
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleTeamTypeSelect('professional')}
                  className="h-auto p-4 justify-start border-purple-200 hover:bg-purple-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Équipe professionnelle</div>
                      <div className="text-sm text-gray-500">
                        Prestataires et fournisseurs
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Select specific person/vendor
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-purple-600 hover:text-purple-700"
                >
                  ← Retour
                </Button>
              </div>

              <h3 className="font-medium text-gray-900">
                {teamType === 'personal' ? 'Sélectionnez une personne :' : 'Sélectionnez un prestataire :'}
              </h3>

              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    teamType === 'personal' 
                      ? "Choisir une personne..." 
                      : "Choisir un prestataire..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {teamType === 'personal' ? (
                    filteredPeople.length > 0 ? (
                      filteredPeople.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{person.name}</span>
                            {person.role && (
                              <span className="text-xs text-gray-500">{person.role}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-people" disabled>
                        Aucune personne disponible
                      </SelectItem>
                    )
                  ) : (
                    filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{vendor.name}</span>
                            {vendor.service_type && (
                              <span className="text-xs text-gray-500">{vendor.service_type}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-vendors" disabled>
                        Aucun prestataire disponible
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleContinue}
                disabled={!selectedUserId || selectedUserId === 'no-people' || selectedUserId === 'no-vendors'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Accéder à mon planning du jour J
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

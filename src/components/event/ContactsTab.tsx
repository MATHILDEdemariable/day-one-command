
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building2, Phone, Mail, User } from 'lucide-react';
import { useSharedEventData } from '@/hooks/useSharedEventData';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

interface ContactsTabProps {
  userId: string;
  userType: 'person' | 'vendor';
}

const roleLabels = {
  bride: "Mariée",
  groom: "Marié",
  "best-man": "Témoin", 
  "maid-of-honor": "Demoiselle d'honneur",
  "wedding-planner": "Wedding Planner",
  photographer: "Photographe",
  caterer: "Traiteur",
  guest: "Invité",
  family: "Famille"
};

export const ContactsTab: React.FC<ContactsTabProps> = ({ userId, userType }) => {
  const [activeSection, setActiveSection] = useState<'team' | 'vendors'>('team');
  const { people, vendors } = useSharedEventData();
  const { currentEventId } = useCurrentEvent();

  // Filter data by current event to ensure synchronization
  const eventPeople = people.filter(person => person.event_id === currentEventId);
  const eventVendors = vendors.filter(vendor => vendor.event_id === currentEventId);

  console.log('ContactsTab - Current event ID:', currentEventId);
  console.log('ContactsTab - All people:', people);
  console.log('ContactsTab - Filtered people:', eventPeople);
  console.log('ContactsTab - All vendors:', vendors);
  console.log('ContactsTab - Filtered vendors:', eventVendors);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">En attente</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 text-xs">Refusé</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Signé</Badge>;
      case 'quote':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Devis</Badge>;
      case 'negotiation':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Négociation</Badge>;
      case 'rejecte, rejected':
        return <Badge className="bg-red-100 text-red-800 text-xs">Refusé</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Section Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeSection === 'team' ? 'default' : 'outline'}
          onClick={() => setActiveSection('team')}
          className={`flex-1 text-xs lg:text-sm px-2 lg:px-4 ${activeSection === 'team' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
        >
          <Users className="w-4 h-4 mr-1 lg:mr-2" />
          Équipe ({eventPeople.length})
        </Button>
        <Button
          variant={activeSection === 'vendors' ? 'default' : 'outline'}
          onClick={() => setActiveSection('vendors')}
          className={`flex-1 text-xs lg:text-sm px-2 lg:px-4 ${activeSection === 'vendors' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
        >
          <Building2 className="w-4 h-4 mr-1 lg:mr-2" />
          Prestataires ({eventVendors.length})
        </Button>
      </div>

      {/* Team Section */}
      {activeSection === 'team' && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg text-gray-900">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
              Équipe de l'événement
            </CardTitle>
            <p className="text-xs lg:text-sm text-gray-600">Contacts de tous les membres de l'équipe</p>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {eventPeople.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <Users className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
                <p className="text-sm lg:text-base">Aucun membre d'équipe trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventPeople.map((person) => (
                  <div 
                    key={person.id}
                    className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all ${
                      person.id === userId && userType === 'person' ? 'ring-2 ring-purple-200 bg-purple-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm lg:text-base text-gray-900">{person.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {person.id === userId && userType === 'person' && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">Vous</Badge>
                          )}
                          {getStatusBadge(person.confirmation_status || 'pending')}
                        </div>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 truncate">
                        {roleLabels[person.role as keyof typeof roleLabels] || 'Membre de l\'équipe'}
                      </p>
                    </div>
                    
                    {/* Contact Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {person.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${person.phone}`, '_self')}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                      {person.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${person.email}`, '_self')}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendors Section */}
      {activeSection === 'vendors' && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg text-gray-900">
              <Building2 className="w-4 h-4 lg:w-5 lg:h-5 text-pink-500" />
              Prestataires
            </CardTitle>
            <p className="text-xs lg:text-sm text-gray-600">Contacts de tous les prestataires de l'événement</p>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {eventVendors.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <Building2 className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
                <p className="text-sm lg:text-base">Aucun prestataire trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventVendors.map((vendor) => (
                  <div 
                    key={vendor.id}
                    className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all ${
                      vendor.id === userId && userType === 'vendor' ? 'ring-2 ring-pink-200 bg-pink-50' : ''
                    }`}
                  >
                    {/* Logo/Icon */}
                    <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm lg:text-base text-gray-900">{vendor.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {vendor.id === userId && userType === 'vendor' && (
                            <Badge className="bg-pink-100 text-pink-800 text-xs">Vous</Badge>
                          )}
                          {getContractStatusBadge(vendor.contract_status || 'quote')}
                        </div>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 truncate">{vendor.service_type || 'Prestataire'}</p>
                      {vendor.contact_person && (
                        <p className="text-xs text-gray-500 truncate">Contact: {vendor.contact_person}</p>
                      )}
                    </div>
                    
                    {/* Contact Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {vendor.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${vendor.phone}`, '_self')}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                      {vendor.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${vendor.email}`, '_self')}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Clock } from 'lucide-react';
import { useSharedEventData } from '@/hooks/useSharedEventData';
import { useNavigate } from 'react-router-dom';

interface TimelineProps {
  viewMode: 'personal' | 'global';
  userRole: string;
  userId?: string;
}

const ROLE_LABELS = {
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

export const Timeline: React.FC<TimelineProps> = ({ viewMode, userRole, userId }) => {
  const { timelineItems, people, loading } = useSharedEventData();
  const navigate = useNavigate();

  console.log('Timeline component - Data received:', {
    timelineItemsCount: timelineItems.length,
    peopleCount: people.length,
    viewMode,
    userRole,
    userId
  });

  // Fonction pour obtenir l'ID utilisateur basé sur le rôle si userId n'est pas fourni
  const getCurrentUserId = () => {
    if (userId) return userId;
    
    // Fallback: chercher une personne avec le rôle correspondant
    const matchingPerson = people.find(person => person.role === userRole);
    console.log('Timeline - Looking for user with role:', userRole, 'found:', matchingPerson);
    return matchingPerson?.id || null;
  };

  const filteredItems = viewMode === 'personal' 
    ? timelineItems.filter(item => {
        const currentUserId = getCurrentUserId();
        
        console.log('Timeline - Filtering item:', item.title, {
          assigned_person_ids: item.assigned_person_ids,
          assigned_person_id: item.assigned_person_id,
          assigned_role: item.assigned_role,
          currentUserId,
          userRole
        });
        
        // Nouvelle logique : vérifier si l'utilisateur est dans la liste des personnes assignées
        if (item.assigned_person_ids && item.assigned_person_ids.length > 0 && currentUserId) {
          return item.assigned_person_ids.includes(currentUserId);
        }
        
        // Fallback sur l'ancien système pour compatibilité
        return item.assigned_person_id === currentUserId || item.assigned_role === userRole;
      })
    : timelineItems;

  console.log('Timeline - Filtered items count:', filteredItems.length);

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins}min`;
  };

  // Fonction pour obtenir les noms des personnes assignées
  const getAssignedPersonsDisplay = (item: any) => {
    if (item.assigned_person_ids && item.assigned_person_ids.length > 0) {
      const assignedPeople = people.filter(person => 
        item.assigned_person_ids.includes(person.id)
      );
      
      console.log('Timeline - Assigned people for item', item.title, ':', assignedPeople);
      
      if (assignedPeople.length === 0) return "Personnes assignées";
      if (assignedPeople.length === 1) return assignedPeople[0].name;
      if (assignedPeople.length <= 2) {
        return assignedPeople.map(p => p.name).join(", ");
      }
      return `${assignedPeople.slice(0, 2).map(p => p.name).join(", ")} et ${assignedPeople.length - 2} autre${assignedPeople.length - 2 > 1 ? 's' : ''}`;
    }
    
    return item.assigned_role || "Non assigné";
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-purple-600">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {viewMode === 'personal' ? 'Mon Planning' : 'Planning de l\'événement'}
        </h2>
        <Badge variant="secondary" className="text-xs">
          {filteredItems.length} étapes
        </Badge>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {viewMode === 'personal' 
                ? 'Aucune étape ne vous est assignée' 
                : 'Aucun planning créé pour cet événement'}
            </p>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Créer un planning dans l'Admin Portal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const startTime = formatTime(item.time);
            const endTime = formatTime(calculateEndTime(item.time, item.duration));
            
            return (
              <Card 
                key={item.id} 
                className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-3 text-white">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-purple-600">{startTime}</span>
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                            {startTime} - {endTime}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                      {formatDuration(item.duration)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Assigné à:</span>
                      <Badge variant="outline" className="text-xs">
                        {getAssignedPersonsDisplay(item)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

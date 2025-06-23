
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimelineItems } from '@/hooks/useTimelineItems';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';
import { usePeople } from '@/hooks/usePeople';

interface UnifiedPersonalPlanningProps {
  userId: string;
  userName: string;
  userType: 'person' | 'vendor';
  viewMode: 'personal' | 'global';
  onViewModeChange: (mode: 'personal' | 'global') => void;
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

export const UnifiedPersonalPlanning: React.FC<UnifiedPersonalPlanningProps> = ({ 
  userId, 
  userName, 
  userType,
  viewMode,
  onViewModeChange
}) => {
  const { timelineItems, loading } = useTimelineItems();
  const { currentEventId } = useCurrentEvent();
  const { people } = usePeople();

  // Filter timeline items by current event
  const eventTimelineItems = timelineItems.filter(item => item.event_id === currentEventId);

  // Filter according to view mode
  const filteredTimelineItems = viewMode === 'personal' 
    ? eventTimelineItems.filter(item => {
        if (userType === 'person') {
          return item.assigned_person_id === userId;
        } else {
          return item.assigned_role === userId;
        }
      })
    : eventTimelineItems;

  const formatTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${time.substring(0, 5)} - ${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const getPersonName = (personId: string | null) => {
    if (!personId) return null;
    const person = people.find(p => p.id === personId);
    return person ? person.name : null;
  };

  const getPersonRole = (personId: string | null) => {
    if (!personId) return null;
    const person = people.find(p => p.id === personId);
    if (!person?.role) return null;
    return roleLabels[person.role as keyof typeof roleLabels] || person.role;
  };

  const isUserItem = (item: any) => {
    if (userType === 'person') {
      return item.assigned_person_id === userId;
    } else {
      return item.assigned_role === userId;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4 lg:p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg text-gray-900">
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500 flex-shrink-0" />
              <span className="truncate">
                {viewMode === 'personal' ? 'Mon Planning' : 'Planning de l\'événement'}
              </span>
            </CardTitle>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">
              {viewMode === 'personal' 
                ? 'Vos étapes et tâches assignées'
                : 'Déroulé complet de la journée et étapes planifiées'
              }
            </p>
          </div>
          
          {/* Toggle between personal and global view */}
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'personal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('personal')}
              className={`text-xs py-1 h-7 lg:h-8 ${
                viewMode === 'personal' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                  : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              Mon Planning
            </Button>
            <Button
              variant={viewMode === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('global')}
              className={`text-xs py-1 h-7 lg:h-8 ${
                viewMode === 'global' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                  : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              Planning Général
            </Button>
            <Badge variant="secondary" className="text-xs ml-2">
              {filteredTimelineItems.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {filteredTimelineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm lg:text-base">
              {viewMode === 'personal' 
                ? 'Aucune étape ne vous est assignée'
                : 'Aucune étape planifiée pour le moment'
              }
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Les étapes seront créées via l'Admin Portal
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTimelineItems.map((item) => {
              const personName = getPersonName(item.assigned_person_id);
              const personRole = getPersonRole(item.assigned_person_id);
              const isCurrentUser = isUserItem(item);
              
              return (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg border backdrop-blur-sm shadow-sm transition-all hover:shadow-md ${
                    viewMode === 'global' && isCurrentUser 
                      ? 'border-purple-300 bg-purple-50/90 ring-1 ring-purple-200' 
                      : 'border-gray-200 bg-white/90'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-white ${
                      isCurrentUser 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-2">
                      {/* Time in prominent position */}
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold whitespace-nowrap ${
                          isCurrentUser ? 'text-purple-600' : 'text-gray-700'
                        }`}>
                          {formatTime(item.time, item.duration)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({item.duration}min)
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h4 className="font-medium text-sm lg:text-base text-gray-900 break-words">
                        {item.title}
                      </h4>
                    </div>

                    {item.description && (
                      <p className="text-xs lg:text-sm text-gray-600 mb-2 break-words">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs text-gray-500">
                      {item.category && (
                        <span className="truncate">• {item.category}</span>
                      )}
                      {item.status && item.status !== 'scheduled' && (
                        <span className="capitalize">
                          • {item.status === 'completed' ? 'Terminé' : 
                             item.status === 'in_progress' ? 'En cours' : 
                             item.status === 'delayed' ? 'Retardé' : item.status}
                        </span>
                      )}
                      
                      {/* Show assignment info in global mode */}
                      {viewMode === 'global' && (personName || item.assigned_role) && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className={isCurrentUser ? 'font-medium text-purple-600' : ''}>
                            {personName ? (
                              <>
                                {personName}
                                {personRole && ` (${personRole})`}
                              </>
                            ) : (
                              roleLabels[item.assigned_role as keyof typeof roleLabels] || item.assigned_role
                            )}
                            {isCurrentUser && ' (Vous)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

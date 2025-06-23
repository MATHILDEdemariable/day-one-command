
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, CheckCircle, Settings } from 'lucide-react';
import { useSharedEventData } from '@/hooks/useSharedEventData';
import { useTimelineItems } from '@/hooks/useTimelineItems';
import { useNavigate } from 'react-router-dom';

interface PersonalPlanningTimelineProps {
  personId: string;
  personName: string;
}

export const PersonalPlanningTimeline: React.FC<PersonalPlanningTimelineProps> = ({ 
  personId, 
  personName 
}) => {
  const { people } = useSharedEventData();
  const { timelineItems, calculateEndTime } = useTimelineItems();
  const navigate = useNavigate();

  // Filtrer les items de timeline assignés à cette personne
  const personalTimelineItems = timelineItems.filter(item => 
    item.assigned_person_id === personId
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins}min`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return '📅 Planifié';
      case 'in_progress': return '🔄 En cours';
      case 'completed': return '✅ Terminé';
      case 'delayed': return '⚠️ Retardé';
      default: return status;
    }
  };

  const completedCount = personalTimelineItems.filter(item => item.status === 'completed').length;
  const totalCount = personalTimelineItems.length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Calendar className="w-5 h-5 text-purple-500" />
              Mon Planning Personnel
            </CardTitle>
            <p className="text-sm text-gray-600">Vos étapes assignées pour l'événement</p>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            {completedCount}/{totalCount} terminées
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {personalTimelineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">Aucune étape ne vous est assignée pour le moment</p>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Créer un planning dans l'Admin Portal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {personalTimelineItems.map((item, index) => {
              const startTime = formatTime(item.time);
              const endTime = formatTime(calculateEndTime(item.time, item.duration));
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    item.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      item.status === 'completed' 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        startTime
                      )}
                    </div>
                    {index < personalTimelineItems.length - 1 && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-purple-300 to-pink-300 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold text-gray-900 ${
                        item.status === 'completed' ? 'line-through text-gray-600' : ''
                      }`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {startTime} - {endTime}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(item.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {personName}
                      </div>
                      {item.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          🔴 Urgent
                        </Badge>
                      )}
                    </div>
                    
                    {item.notes && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600">
                        <strong>Note:</strong> {item.notes}
                      </div>
                    )}
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

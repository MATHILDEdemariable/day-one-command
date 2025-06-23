
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckSquare, Clock, Folder, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSharedEventData } from '@/hooks/useSharedEventData';
import { useTimelineItems } from '@/hooks/useTimelineItems';
import { useEventDocuments } from '@/hooks/useEventDocuments';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

interface PersonalDashboardProps {
  personId: string;
  personName: string;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ 
  personId, 
  personName 
}) => {
  const { tasks, getDaysUntilEvent } = useSharedEventData();
  const { timelineItems } = useTimelineItems();
  const { currentEventId } = useCurrentEvent();
  const { documents } = useEventDocuments(currentEventId);

  const daysUntilEvent = getDaysUntilEvent();

  // Calculs personnels
  const personalTasks = tasks.filter(task => task.assigned_person_id === personId);
  const personalTimelineItems = timelineItems.filter(item => item.assigned_person_id === personId);
  const personalDocuments = documents.filter(doc => doc.assigned_to && doc.assigned_to.includes(personId));

  const completedTasks = personalTasks.filter(task => task.status === 'completed').length;
  const urgentTasks = personalTasks.filter(task => task.priority === 'high' && task.status !== 'completed').length;
  const completedTimelineItems = personalTimelineItems.filter(item => item.status === 'completed').length;
  const delayedItems = personalTimelineItems.filter(item => item.status === 'delayed').length;

  const totalPersonalProgress = personalTasks.length + personalTimelineItems.length;
  const totalPersonalCompleted = completedTasks + completedTimelineItems;
  const personalProgressPercentage = totalPersonalProgress > 0 ? Math.round((totalPersonalCompleted / totalPersonalProgress) * 100) : 0;

  // Prochaine étape
  const nextTimelineItem = personalTimelineItems
    .filter(item => item.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  // Prochaine tâche urgente
  const nextUrgentTask = personalTasks
    .filter(task => task.priority === 'high' && task.status !== 'completed')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bonjour, {personName}!</h2>
              <p className="text-purple-100">
                Il reste <strong>{daysUntilEvent} jour{daysUntilEvent !== 1 ? 's' : ''}</strong> avant l'événement
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{personalProgressPercentage}%</div>
              <div className="text-sm text-purple-100">Progression globale</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{personalTimelineItems.length}</div>
            <div className="text-sm text-gray-600">Étapes planning</div>
            <Badge variant="outline" className="mt-1 text-xs border-blue-200 text-blue-700">
              {completedTimelineItems} terminées
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{personalTasks.length}</div>
            <div className="text-sm text-gray-600">Tâches assignées</div>
            <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-700">
              {completedTasks} terminées
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Folder className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{personalDocuments.length}</div>
            <div className="text-sm text-gray-600">Documents</div>
            <Badge variant="outline" className="mt-1 text-xs border-purple-200 text-purple-700">
              Assignés
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              urgentTasks > 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${urgentTasks > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div className={`text-2xl font-bold ${urgentTasks > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {urgentTasks}
            </div>
            <div className="text-sm text-gray-600">Tâches urgentes</div>
            {delayedItems > 0 && (
              <Badge variant="destructive" className="mt-1 text-xs">
                {delayedItems} en retard
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(nextTimelineItem || nextUrgentTask) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextTimelineItem && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Prochaine étape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{nextTimelineItem.time.substring(0, 5)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{nextTimelineItem.title}</h4>
                    <p className="text-sm text-gray-600">{nextTimelineItem.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {nextUrgentTask && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Tâche urgente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🔴</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{nextUrgentTask.title}</h4>
                    <p className="text-sm text-gray-600">{nextUrgentTask.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckSquare, Calendar } from 'lucide-react';
import { useSharedEventData } from '@/hooks/useSharedEventData';
import { useTimelineItems } from '@/hooks/useTimelineItems';
import { useToggleTaskStatus } from '@/hooks/useTasks';

interface UnifiedPersonalPlanningProps {
  userId: string;
  userName: string;
  userType: 'person' | 'vendor';
}

interface UnifiedPlanningItem {
  id: string;
  type: 'timeline' | 'task';
  title: string;
  description?: string;
  time?: string;
  duration?: number;
  priority?: string;
  status?: string;
  completed?: boolean;
  category?: string;
}

export const UnifiedPersonalPlanning: React.FC<UnifiedPersonalPlanningProps> = ({ 
  userId, 
  userName, 
  userType 
}) => {
  const { tasks } = useSharedEventData();
  const { timelineItems } = useTimelineItems();
  const toggleTaskStatus = useToggleTaskStatus();

  // Filtrer les éléments selon le type d'utilisateur
  const personalTimelineItems = timelineItems.filter(item => {
    if (userType === 'person') {
      return item.assigned_person_id === userId;
    } else {
      return item.assigned_role === userId; // Pour les vendors, on utilise assigned_role
    }
  });

  const personalTasks = tasks.filter(task => {
    if (userType === 'person') {
      return task.assigned_person_id === userId;
    } else {
      return task.assigned_vendor_id === userId;
    }
  });

  // Combiner timeline et tâches en un tableau unifié
  const unifiedItems: UnifiedPlanningItem[] = [
    ...personalTimelineItems.map(item => ({
      id: item.id,
      type: 'timeline' as const,
      title: item.title,
      description: item.description || undefined,
      time: item.time,
      duration: item.duration,
      status: item.status,
      category: item.category,
      priority: item.priority
    })),
    ...personalTasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      title: task.title,
      description: task.description || undefined,
      priority: task.priority,
      status: task.status,
      completed: task.status === 'completed',
      duration: task.duration_minutes
    }))
  ];

  // Trier : timeline par heure, puis tâches par priorité
  const sortedItems = unifiedItems.sort((a, b) => {
    if (a.type === 'timeline' && b.type === 'timeline') {
      return (a.time || '').localeCompare(b.time || '');
    }
    if (a.type === 'timeline') return -1;
    if (b.type === 'timeline') return 1;
    // Pour les tâches, trier par priorité
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
           (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
  });

  const completedCount = sortedItems.filter(item => 
    item.type === 'timeline' ? item.status === 'completed' : item.completed
  ).length;

  const progressPercentage = sortedItems.length > 0 ? Math.round((completedCount / sortedItems.length) * 100) : 0;

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTaskStatus.mutateAsync({ id: taskId, completed });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const formatTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${time.substring(0, 5)} - ${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Calendar className="w-5 h-5 text-purple-500" />
              Mon Planning & Mes Tâches
            </CardTitle>
            <p className="text-sm text-gray-600">Votre planning personnalisé et vos tâches assignées</p>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            {completedCount}/{sortedItems.length} terminé{completedCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression globale</span>
            <span className="text-sm text-gray-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune tâche ou étape ne vous est assignée pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div 
                key={`${item.type}-${item.id}`}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  item.type === 'timeline' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                } ${
                  (item.completed || item.status === 'completed') ? 'opacity-60' : ''
                }`}
              >
                {/* Icône et indicateur */}
                <div className="flex-shrink-0">
                  {item.type === 'timeline' ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Checkbox
                        checked={item.completed || false}
                        onCheckedChange={(checked) => handleToggleTask(item.id, !!checked)}
                        disabled={toggleTaskStatus.isPending}
                      />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      (item.completed || item.status === 'completed') ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    
                    <Badge variant="outline" className="text-xs">
                      {item.type === 'timeline' ? '📅 Planning' : '✅ Tâche'}
                    </Badge>

                    {item.priority && (
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.priority === 'high' ? 'Haute' : item.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {item.time && item.duration && (
                      <span className="font-medium text-blue-600">
                        {formatTime(item.time, item.duration)}
                      </span>
                    )}
                    {item.duration && (
                      <span>Durée: {item.duration}min</span>
                    )}
                    {item.category && (
                      <span>• {item.category}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

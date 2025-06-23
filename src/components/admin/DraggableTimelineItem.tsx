
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Clock, Users, GripVertical } from 'lucide-react';
import { TimelineItem } from '@/hooks/useTimelineItems';

interface DraggableTimelineItemProps {
  item: TimelineItem;
  index: number;
  onEdit: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
  categoryColors: Record<string, string>;
  statusColors: Record<string, string>;
  formatDuration: (minutes: number) => string;
  calculateEndTime: (startTime: string, duration: number) => string;
  getPersonName: (personId: string | null) => string | null;
  getStatusLabel: (status: string) => string;
  isDragging: boolean;
  draggedOverIndex: number | null;
  previewTimes: { startTime: string; endTime: string } | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
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

export const DraggableTimelineItem: React.FC<DraggableTimelineItemProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  categoryColors,
  statusColors,
  formatDuration,
  calculateEndTime,
  getPersonName,
  getStatusLabel,
  isDragging,
  draggedOverIndex,
  previewTimes,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  // Format time to remove seconds (08:00:00 -> 08:00)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const displayStartTime = previewTimes ? formatTime(previewTimes.startTime) : formatTime(item.time);
  const displayEndTime = previewTimes ? formatTime(previewTimes.endTime) : formatTime(calculateEndTime(item.time, item.duration));
  const personName = getPersonName(item.assigned_person_id);

  return (
    <>
      {/* Drop zone indicator above */}
      {draggedOverIndex === index && (
        <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-4 opacity-70 animate-pulse" />
      )}
      
      <Card 
        className={`transition-all duration-200 hover:shadow-lg border-stone-200 cursor-move ${
          isDragging ? 'opacity-60 scale-95 rotate-1 shadow-xl border-purple-300' : 'hover:shadow-md hover:border-purple-200'
        } ${previewTimes ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}`}
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
        onDragEnd={onDragEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div className="flex flex-col items-center cursor-move pt-2 hover:text-purple-600 transition-colors">
              <GripVertical className="w-5 h-5 text-stone-400 hover:text-purple-500" />
            </div>
            
            <div className="flex-1">
              {/* Header avec horaires en priorité */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* Horaires en gros et priorité - Format amélioré */}
                  <div className={`text-2xl font-bold mb-1 transition-colors ${
                    previewTimes ? 'text-purple-600 animate-pulse' : 'text-purple-700'
                  }`}>
                    {displayStartTime} - {displayEndTime}
                  </div>
                  
                  {/* Titre et badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-stone-800 text-lg">{item.title}</h4>
                    <Badge className={categoryColors[item.category] || categoryColors["Préparation"]}>
                      {item.category}
                    </Badge>
                    <Badge className={statusColors[item.status]}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    {item.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        🔴 Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer "{item.title}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(item.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {/* Description */}
              {item.description && (
                <p className="text-sm text-stone-600 mb-3">{item.description}</p>
              )}
              
              {/* Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.duration)}
                  </div>
                  {personName && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{personName}</span>
                    </div>
                  )}
                  {item.assigned_role && !personName && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{roleLabels[item.assigned_role as keyof typeof roleLabels] || item.assigned_role.replace('-', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="mt-2 p-2 bg-stone-50 rounded text-xs text-stone-600">
                  <strong>Note:</strong> {item.notes}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

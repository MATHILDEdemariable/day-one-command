
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTaskData, Task } from '@/hooks/useTasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => void;
  task?: Task | null;
  isLoading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateTaskData>();

  const priorityValue = watch('priority');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        duration_minutes: task.duration_minutes,
        assigned_role: task.assigned_role || '',
        notes: task.notes || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        duration_minutes: 30,
        assigned_role: '',
        notes: '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = (data: CreateTaskData) => {
    onSubmit(data);
    if (!task) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">
            {task ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Modifiez les détails de la tâche' : 'Définissez les détails de la nouvelle tâche'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Le titre est requis' })}
                placeholder="Nom de la tâche"
                className="border-stone-300 focus:border-emerald-500"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description détaillée de la tâche"
                className="border-stone-300 focus:border-emerald-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  {...register('duration_minutes', { 
                    required: 'La durée est requise',
                    min: { value: 1, message: 'La durée doit être d\'au moins 1 minute' }
                  })}
                  placeholder="30"
                  className="border-stone-300 focus:border-emerald-500"
                />
                {errors.duration_minutes && (
                  <p className="text-red-600 text-sm mt-1">{errors.duration_minutes.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priorité *</Label>
                <Select value={priorityValue} onValueChange={(value) => setValue('priority', value as 'high' | 'medium' | 'low')}>
                  <SelectTrigger className="border-stone-300 focus:border-emerald-500">
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Haute</SelectItem>
                    <SelectItem value="medium">🟡 Moyenne</SelectItem>
                    <SelectItem value="low">🟢 Basse</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="assigned_role">Assigné à</Label>
              <Select onValueChange={(value) => setValue('assigned_role', value)}>
                <SelectTrigger className="border-stone-300 focus:border-emerald-500">
                  <SelectValue placeholder="Sélectionner une personne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding-planner">Wedding Planner</SelectItem>
                  <SelectItem value="bride">Mariée</SelectItem>
                  <SelectItem value="groom">Marié</SelectItem>
                  <SelectItem value="maid-of-honor">Demoiselle d'honneur</SelectItem>
                  <SelectItem value="best-man">Témoin</SelectItem>
                  <SelectItem value="photographer">Photographe</SelectItem>
                  <SelectItem value="caterer">Traiteur</SelectItem>
                  <SelectItem value="florist">Fleuriste</SelectItem>
                  <SelectItem value="musician">Musicien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Notes additionnelles"
                className="border-stone-300 focus:border-emerald-500"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isLoading ? 'Sauvegarde...' : task ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

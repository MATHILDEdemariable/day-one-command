
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimelineItem } from '@/hooks/useTimelineItems';
import { usePeople } from '@/hooks/usePeople';

interface TimelineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TimelineItem>) => void;
  item?: TimelineItem | null;
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

export const TimelineItemModal: React.FC<TimelineItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item
}) => {
  const { people } = usePeople();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '08:00',
    duration: 60,
    category: 'Préparation',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'delayed',
    assigned_person_id: '',
    notes: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        time: item.time,
        duration: item.duration,
        category: item.category,
        priority: item.priority,
        status: item.status,
        assigned_person_id: item.assigned_person_id || '',
        notes: item.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        time: '08:00',
        duration: 60,
        category: 'Préparation',
        priority: 'medium',
        status: 'scheduled',
        assigned_person_id: '',
        notes: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assigned_person_id: formData.assigned_person_id === 'none' ? null : formData.assigned_person_id || null,
      description: formData.description || null,
      notes: formData.notes || null
    });
  };

  const categories = ['Préparation', 'Logistique', 'Cérémonie', 'Photos', 'Réception'];
  const priorities = [
    { value: 'low', label: '🟢 Basse' },
    { value: 'medium', label: '🟡 Moyenne' },
    { value: 'high', label: '🔴 Haute' }
  ];
  const statuses = [
    { value: 'scheduled', label: '📅 Planifié' },
    { value: 'in_progress', label: '🔄 En cours' },
    { value: 'completed', label: '✅ Terminé' },
    { value: 'delayed', label: '⚠️ Retardé' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Modifier l\'étape' : 'Nouvelle étape/tâche'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="time">Heure de début</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: 'scheduled' | 'in_progress' | 'completed' | 'delayed') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigned_person">Personne assignée</Label>
              <Select 
                value={formData.assigned_person_id || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_person_id: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une personne" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="none">Aucune assignation</SelectItem>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} {person.role && `(${roleLabels[person.role as keyof typeof roleLabels] || person.role})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Notes supplémentaires..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {item ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

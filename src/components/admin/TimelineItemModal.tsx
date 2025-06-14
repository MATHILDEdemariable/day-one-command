
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimelineItem } from '@/hooks/useTimelineItems';
import { PersonMultiSelect } from './PersonMultiSelect';
import { useVendors } from '@/hooks/useVendors';

interface TimelineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TimelineItem>) => void;
  item?: TimelineItem | null;
}

export const TimelineItemModal: React.FC<TimelineItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '08:00',
    duration: 60,
    category: 'Préparation',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'delayed',
    assigned_person_ids: [] as string[],
    assigned_vendor_id: '' as string | null,
    notes: ''
  });

  const { vendors, loading: vendorsLoading } = useVendors();

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        time: item.time,
        duration: item.duration,
        category: item.category,
        priority: (item.priority as 'low'|'medium'|'high') ?? 'medium',
        status: (item.status as 'scheduled'|'in_progress'|'completed'|'delayed') ?? 'scheduled',
        assigned_person_ids: item.assigned_person_ids || [],
        assigned_vendor_id: item.assigned_vendor_id || 'none',
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
        assigned_person_ids: [],
        assigned_vendor_id: 'none',
        notes: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      description: formData.description || null,
      notes: formData.notes || null,
      assigned_vendor_id: formData.assigned_vendor_id === 'none' ? null : formData.assigned_vendor_id,
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

          <div className="grid grid-cols-1 gap-4">
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
          </div>

          {/* Person selection */}
          <PersonMultiSelect
            selectedPersonIds={formData.assigned_person_ids}
            onSelectionChange={(personIds) => setFormData(prev => ({ ...prev, assigned_person_ids: personIds }))}
            label="Personnes assignées"
          />

          {/* Vendor Selector, single vendor */}
          <div>
            <Label htmlFor="assigned_vendor_id">Prestataire assigné</Label>
            <Select
              value={formData.assigned_vendor_id || 'none'}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  assigned_vendor_id: value
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun prestataire" />
              </SelectTrigger>
              <SelectContent>
                {vendorsLoading && (
                  <SelectItem value="none" disabled>Chargement...</SelectItem>
                )}
                <SelectItem value="none">Aucun</SelectItem>
                {vendors.map(vendor => (
                  <SelectItem value={vendor.id} key={vendor.id}>
                    {vendor.name} ({vendor.service_type || "service"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

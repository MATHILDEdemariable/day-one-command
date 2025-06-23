import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

export interface TimelineItem {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  time: string;
  duration: number;
  category: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  assigned_person_id: string | null;
  assigned_role: string | null;
  order_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Type helper pour mapper les données Supabase vers notre interface
type SupabaseTimelineItem = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  time: string;
  duration: number;
  category: string | null;
  status: string | null;
  priority: string | null;
  assigned_person_id: string | null;
  assigned_role: string | null;
  order_index: number;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const mapSupabaseToTimelineItem = (item: SupabaseTimelineItem): TimelineItem => ({
  ...item,
  category: item.category || 'Préparation',
  status: (item.status as TimelineItem['status']) || 'scheduled',
  priority: (item.priority as TimelineItem['priority']) || 'medium',
  created_at: item.created_at || new Date().toISOString(),
  updated_at: item.updated_at || new Date().toISOString(),
});

export const useTimelineItems = () => {
  const { toast } = useToast();
  const { currentEventId } = useCurrentEvent();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTimelineItems = async () => {
    if (!currentEventId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('timeline_items')
        .select('*')
        .eq('event_id', currentEventId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      const mappedData = data ? data.map(mapSupabaseToTimelineItem) : [];
      setTimelineItems(mappedData);
    } catch (error) {
      console.error('Error loading timeline items:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les éléments de timeline',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTimelineItem = async (item: Omit<TimelineItem, 'id' | 'event_id' | 'created_at' | 'updated_at'>) => {
    if (!currentEventId) return;

    try {
      const { data, error } = await supabase
        .from('timeline_items')
        .insert({
          ...item,
          event_id: currentEventId,
        })
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = mapSupabaseToTimelineItem(data);
      setTimelineItems(prev => [...prev, mappedData]);
      toast({
        title: 'Succès',
        description: 'Élément ajouté à la timeline',
      });
    } catch (error) {
      console.error('Error adding timeline item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'élément',
        variant: 'destructive',
      });
    }
  };

  const updateTimelineItem = async (id: string, updates: Partial<TimelineItem>) => {
    try {
      const { data, error } = await supabase
        .from('timeline_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = mapSupabaseToTimelineItem(data);
      setTimelineItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...mappedData } : item
      ));
      
      toast({
        title: 'Succès',
        description: 'Élément mis à jour',
      });
    } catch (error) {
      console.error('Error updating timeline item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'élément',
        variant: 'destructive',
      });
    }
  };

  const deleteTimelineItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timeline_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTimelineItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Succès',
        description: 'Élément supprimé',
      });
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'élément',
        variant: 'destructive',
      });
    }
  };

  const reorderItems = async (fromIndex: number, toIndex: number) => {
    const newItems = [...timelineItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);

    // Recalculate times for all items starting from the first one
    let currentTime = newItems.length > 0 ? newItems[0].time : '08:00';
    
    const updatedItems = newItems.map((item, index) => {
      if (index === 0) {
        // First item keeps its original time or 08:00 if no items
        return { ...item, order_index: index };
      } else {
        // Calculate start time based on previous item's end time
        const prevItem = newItems[index - 1];
        const startTime = calculateEndTime(currentTime, prevItem.duration);
        currentTime = startTime;
        return { ...item, time: startTime, order_index: index };
      }
    });

    try {
      // Update all items in the database with new order and times
      for (const item of updatedItems) {
        await supabase
          .from('timeline_items')
          .update({ 
            order_index: item.order_index,
            time: item.time
          })
          .eq('id', item.id);
      }
      
      setTimelineItems(updatedItems);
      
      toast({
        title: 'Succès',
        description: 'Timeline réorganisée avec recalcul automatique des horaires',
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de réorganiser les éléments',
        variant: 'destructive',
      });
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    // Remove seconds if present and parse time
    const timeWithoutSeconds = startTime.substring(0, 5);
    const [hours, minutes] = timeWithoutSeconds.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return timelineItems.reduce((total, item) => total + item.duration, 0);
  };

  const getEndTime = () => {
    if (timelineItems.length === 0) return '08:00';
    const lastItem = timelineItems[timelineItems.length - 1];
    return calculateEndTime(lastItem.time, lastItem.duration);
  };

  useEffect(() => {
    loadTimelineItems();
  }, [currentEventId]);

  return {
    timelineItems,
    loading,
    loadTimelineItems,
    addTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    reorderItems,
    calculateEndTime,
    getTotalDuration,
    getEndTime,
  };
};

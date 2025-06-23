
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  description: string | null;
  google_drive_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      
      // Set the first event as current if none selected
      if (!currentEvent && data && data.length > 0) {
        setCurrentEvent(data[0]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEventGoogleDriveUrl = async (eventId: string, googleDriveUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ google_drive_url: googleDriveUrl })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, google_drive_url: googleDriveUrl } : event
      ));
      
      if (currentEvent?.id === eventId) {
        setCurrentEvent(prev => prev ? { ...prev, google_drive_url: googleDriveUrl } : null);
      }

      toast({
        title: 'Succès',
        description: 'URL Google Drive sauvegardée',
      });
    } catch (error) {
      console.error('Error updating Google Drive URL:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'URL Google Drive',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    currentEvent,
    setCurrentEvent,
    loading,
    loadEvents,
    updateEventGoogleDriveUrl
  };
};

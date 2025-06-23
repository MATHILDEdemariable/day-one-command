
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventConfiguration {
  id?: string;
  event_id: string;
  theme_color: string;
  logo_url?: string;
  notifications_enabled: boolean;
  realtime_sync_enabled: boolean;
  guest_access_enabled: boolean;
  auto_backup_enabled: boolean;
}

interface EventRole {
  id?: string;
  event_id: string;
  role_name: string;
  is_active: boolean;
  is_default: boolean;
}

export const useEventConfiguration = (eventId: string) => {
  const [configuration, setConfiguration] = useState<EventConfiguration | null>(null);
  const [roles, setRoles] = useState<EventRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      fetchConfiguration();
      fetchRoles();
    }
  }, [eventId]);

  const fetchConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('event_configurations')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfiguration(data);
      } else {
        // Create default configuration if none exists
        const defaultConfig = {
          event_id: eventId,
          theme_color: '#9333ea',
          notifications_enabled: true,
          realtime_sync_enabled: true,
          guest_access_enabled: false,
          auto_backup_enabled: true,
        };
        setConfiguration(defaultConfig);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('event_roles')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const saveConfiguration = async (config: Partial<EventConfiguration>) => {
    try {
      setLoading(true);
      
      if (configuration?.id) {
        // Update existing configuration
        const { error } = await supabase
          .from('event_configurations')
          .update(config)
          .eq('id', configuration.id);

        if (error) throw error;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('event_configurations')
          .insert({ ...config, event_id: eventId })
          .select()
          .single();

        if (error) throw error;
        setConfiguration(data);
      }

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres ont été mis à jour avec succès",
      });

      await fetchConfiguration();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (roleId: string, updates: Partial<EventRole>) => {
    try {
      const { error } = await supabase
        .from('event_roles')
        .update(updates)
        .eq('id', roleId);

      if (error) throw error;

      await fetchRoles();
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle a été modifié avec succès",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  const addRole = async (roleName: string) => {
    try {
      const { error } = await supabase
        .from('event_roles')
        .insert({
          event_id: eventId,
          role_name: roleName,
          is_active: true,
          is_default: false,
        });

      if (error) throw error;

      await fetchRoles();
      toast({
        title: "Rôle ajouté",
        description: "Le nouveau rôle a été créé avec succès",
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le rôle",
        variant: "destructive",
      });
    }
  };

  return {
    configuration,
    roles,
    loading,
    saveConfiguration,
    updateRole,
    addRole,
  };
};

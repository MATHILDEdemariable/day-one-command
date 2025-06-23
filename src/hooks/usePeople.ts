
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  availability: string;
  status: string;
  event_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const usePeople = () => {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  // Load people from Supabase
  const loadPeople = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to our interface
      const mappedPeople = (data || []).map(person => ({
        id: person.id,
        name: person.name || '',
        role: person.role || '',
        email: person.email || '',
        phone: person.phone || '',
        availability: person.availability_notes || 'full',
        status: person.confirmation_status || 'pending',
        event_id: person.event_id,
        created_at: person.created_at,
        updated_at: person.updated_at,
      }));
      
      setPeople(mappedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les personnes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load people on component mount
  useEffect(() => {
    loadPeople();
  }, []);

  const addPerson = async (newPerson: Omit<Person, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Map our interface to database fields
      const dbPerson = {
        name: newPerson.name,
        role: newPerson.role,
        email: newPerson.email,
        phone: newPerson.phone,
        availability_notes: newPerson.availability,
        confirmation_status: newPerson.status,
        event_id: newPerson.event_id,
      };

      const { data, error } = await supabase
        .from('people')
        .insert(dbPerson)
        .select()
        .single();

      if (error) throw error;
      
      // Map back to our interface
      const mappedPerson = {
        id: data.id,
        name: data.name || '',
        role: data.role || '',
        email: data.email || '',
        phone: data.phone || '',
        availability: data.availability_notes || 'full',
        status: data.confirmation_status || 'pending',
        event_id: data.event_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setPeople(prev => [mappedPerson, ...prev]);
      toast({
        title: 'Succès',
        description: 'Personne ajoutée avec succès',
      });
      
      return mappedPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la personne',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      // Map our interface to database fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.availability !== undefined) dbUpdates.availability_notes = updates.availability;
      if (updates.status !== undefined) dbUpdates.confirmation_status = updates.status;
      if (updates.event_id !== undefined) dbUpdates.event_id = updates.event_id;

      const { data, error } = await supabase
        .from('people')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Map back to our interface
      const mappedPerson = {
        id: data.id,
        name: data.name || '',
        role: data.role || '',
        email: data.email || '',
        phone: data.phone || '',
        availability: data.availability_notes || 'full',
        status: data.confirmation_status || 'pending',
        event_id: data.event_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setPeople(prev => prev.map(person => 
        person.id === id ? { ...person, ...mappedPerson } : person
      ));
      
      toast({
        title: 'Succès',
        description: 'Personne mise à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la personne',
        variant: 'destructive',
      });
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPeople(prev => prev.filter(person => person.id !== id));
      toast({
        title: 'Succès',
        description: 'Personne supprimée avec succès',
      });
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la personne',
        variant: 'destructive',
      });
    }
  };

  return {
    people,
    loading,
    loadPeople,
    addPerson,
    updatePerson,
    deletePerson
  };
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Palette } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EventConfiguration = () => {
  const { currentEvent, events, setCurrentEvent, loading } = useEvents();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    event_type: '',
    event_date: '',
    start_time: '',
    location: '',
    description: '',
    status: 'planning'
  });

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        name: currentEvent.name || '',
        event_type: currentEvent.event_type || '',
        event_date: currentEvent.event_date || '',
        start_time: currentEvent.start_time || '',
        location: currentEvent.location || '',
        description: currentEvent.description || '',
        status: currentEvent.status || 'planning'
      });
    }
  }, [currentEvent]);

  const handleSave = async () => {
    if (!currentEvent) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update(formData)
        .eq('id', currentEvent.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentEvent(data);
      toast({
        title: 'Configuration sauvegardée',
        description: 'Les informations de l\'événement ont été mises à jour',
      });
    } catch (error) {
      console.error('Error saving event configuration:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Configuration de l'Événement</h2>
          <p className="text-gray-600">Gérez les informations principales de votre événement</p>
        </div>
        <div className="flex items-center gap-3">
          {currentEvent && (
            <Badge variant="outline" className="text-sm">
              Événement actuel : {currentEvent.name}
            </Badge>
          )}
          {events.length > 1 && (
            <Select value={currentEvent?.id} onValueChange={(value) => {
              const selectedEvent = events.find(e => e.id === value);
              if (selectedEvent) setCurrentEvent(selectedEvent);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Changer d'événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Informations Générales
            </CardTitle>
            <CardDescription>
              Configurez les détails de base de votre événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Nom de l'événement</Label>
              <Input
                id="event-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom de votre événement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">Type d'événement</Label>
              <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mariage">Mariage</SelectItem>
                  <SelectItem value="anniversaire">Anniversaire</SelectItem>
                  <SelectItem value="conference">Conférence</SelectItem>
                  <SelectItem value="seminaire">Séminaire</SelectItem>
                  <SelectItem value="soiree">Soirée</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">En planification</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description de l'événement"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date et lieu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Date et Lieu
            </CardTitle>
            <CardDescription>
              Définissez quand et où aura lieu votre événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-date" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Date de l'événement
              </Label>
              <Input
                id="event-date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure de début
              </Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lieu
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Adresse ou nom du lieu"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </Button>
      </div>
    </div>
  );
};

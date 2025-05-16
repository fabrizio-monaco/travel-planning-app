'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destinationApi, Destination } from '@/lib/api';
import { getErrorMessage, ensureArray } from '@/lib/utils';
import { toast } from 'sonner';

interface DestinationFormData {
  name: string;
  description: string;
  activities: string;
  photos: string;
  latitude: string;
  longitude: string;
}

interface DestinationFormProps {
  destination?: Destination;
  isEditing?: boolean;
}

export function DestinationForm({ destination, isEditing = false }: DestinationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DestinationFormData>({
    name: '',
    description: '',
    activities: '',
    photos: '',
    latitude: '',
    longitude: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // If editing, populate form with destination data
    if (isEditing && destination) {
      setFormData({
        name: destination.name || '',
        description: destination.description || '',
        activities: ensureArray(destination.activities).join(', '),
        photos: ensureArray(destination.photos).join(', '),
        latitude: destination.latitude?.toString() || '',
        longitude: destination.longitude?.toString() || '',
      });
    }
  }, [isEditing, destination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Destination name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      errors.latitude = 'Latitude must be a valid number';
    }
    
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      errors.longitude = 'Longitude must be a valid number';
    }
    
    // Validate latitude range if provided
    if (formData.latitude && !isNaN(parseFloat(formData.latitude))) {
      const lat = parseFloat(formData.latitude);
      if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
    }
    
    // Validate longitude range if provided
    if (formData.longitude && !isNaN(parseFloat(formData.longitude))) {
      const lng = parseFloat(formData.longitude);
      if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    // Ensure both lat and lng are provided if one is
    if ((formData.latitude && !formData.longitude) || (!formData.latitude && formData.longitude)) {
      if (!formData.latitude) errors.latitude = 'Latitude is required when longitude is provided';
      if (!formData.longitude) errors.longitude = 'Longitude is required when latitude is provided';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the form errors');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Parse activities and photos from comma-separated strings to arrays
      const activities = formData.activities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
        
      const photos = formData.photos
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      
      const destinationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        activities,
        photos,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };
      
      if (isEditing && destination) {
        await destinationApi.update(destination.id, destinationData);
        toast.success('Destination updated successfully');
        router.push(`/destinations/${destination.id}`);
      } else {
        const newDestination = await destinationApi.create(destinationData);
        toast.success('Destination created successfully');
        router.push(`/destinations/${newDestination.id}`);
      }
    } catch (err) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} destination: ${getErrorMessage(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Destination Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Maldives"
            aria-invalid={!!formErrors.name}
            required
          />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Beautiful island paradise"
            aria-invalid={!!formErrors.description}
            required
          />
          {formErrors.description && (
            <p className="text-sm text-red-500">{formErrors.description}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="activities">Activities</Label>
          <Input
            id="activities"
            name="activities"
            value={formData.activities}
            onChange={handleChange}
            placeholder="Snorkeling, Swimming, Sunbathing (comma separated)"
          />
          <p className="text-sm text-gray-500">Separate multiple activities with commas</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="photos">Photos</Label>
          <Input
            id="photos"
            name="photos"
            value={formData.photos}
            onChange={handleChange}
            placeholder="maldives1.jpg, maldives2.jpg (comma separated)"
          />
          <p className="text-sm text-gray-500">Separate multiple photo names/URLs with commas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g., 3.2028"
              aria-invalid={!!formErrors.latitude}
            />
            {formErrors.latitude && (
              <p className="text-sm text-red-500">{formErrors.latitude}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., 73.2207"
              aria-invalid={!!formErrors.longitude}
            />
            {formErrors.longitude && (
              <p className="text-sm text-red-500">{formErrors.longitude}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={isEditing && destination ? `/destinations/${destination.id}` : '/destinations'}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Destination' : 'Create Destination'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

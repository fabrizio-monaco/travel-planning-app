'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tripApi, Trip } from '@/lib/api';
import { formatDate, getErrorMessage, ensureArray, isValidDate } from '@/lib/utils';
import { toast } from 'sonner';

interface TripFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  participants: string;
}

interface TripFormProps {
  trip?: Trip;
  isEditing?: boolean;
}

export function TripForm({ trip, isEditing = false }: TripFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    description: '',
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default to 1 week
    image: '',
    participants: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // If editing, populate form with trip data
    if (isEditing && trip) {
      setFormData({
        name: trip.name || '',
        description: trip.description || '',
        startDate: formatDate(trip.startDate) || formatDate(new Date()),
        endDate: formatDate(trip.endDate) || formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        image: trip.image || '',
        participants: ensureArray(trip.participants).join(', '),
      });
    }
  }, [isEditing, trip]);

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
      errors.name = 'Trip name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else if (!isValidDate(formData.startDate)) {
      errors.startDate = 'Invalid start date';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (!isValidDate(formData.endDate)) {
      errors.endDate = 'Invalid end date';
    }
    
    if (formData.startDate && formData.endDate && 
        isValidDate(formData.startDate) && isValidDate(formData.endDate) &&
        new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be before start date';
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
      
      // Parse participants from comma-separated string to array
      const participants = formData.participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      
      const tripData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        image: formData.image.trim() || undefined,
        participants,
      };
      
      if (isEditing && trip) {
        await tripApi.update(trip.id, tripData);
        toast.success('Trip updated successfully');
        router.push(`/trips/${trip.id}`);
      } else {
        const newTrip = await tripApi.create(tripData);
        toast.success('Trip created successfully');
        router.push(`/trips/${newTrip.id}`);
      }
    } catch (err) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} trip: ${getErrorMessage(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Trip Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Summer Vacation"
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
            placeholder="A relaxing trip to the beach"
            aria-invalid={!!formErrors.description}
            required
          />
          {formErrors.description && (
            <p className="text-sm text-red-500">{formErrors.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              aria-invalid={!!formErrors.startDate}
              required
            />
            {formErrors.startDate && (
              <p className="text-sm text-red-500">{formErrors.startDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              aria-invalid={!!formErrors.endDate}
              required
            />
            {formErrors.endDate && (
              <p className="text-sm text-red-500">{formErrors.endDate}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="participants">Participants</Label>
          <Input
            id="participants"
            name="participants"
            value={formData.participants}
            onChange={handleChange}
            placeholder="John, Jane, Bob (comma separated)"
          />
          <p className="text-sm text-gray-500">Separate multiple participants with commas</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-gray-500">Optional URL to an image for this trip</p>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={isEditing && trip ? `/trips/${trip.id}` : '/trips'}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Trip' : 'Create Trip'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tripsApi } from '@/services/trips-api';
import { Trip } from '@/types';

interface TripEditClientProps {
  initialTripData: Trip;
}

export default function TripEditClient({ initialTripData }: TripEditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialTripData.image || null);
  
  // Format dates for input fields
  const formattedTrip = {
    ...initialTripData,
    startDate: initialTripData.startDate.split('T')[0],
    endDate: initialTripData.endDate.split('T')[0],
  };
  
  const [tripForm, setTripForm] = useState<Partial<Trip>>(formattedTrip);
  
  // Parse the participants from the JSON string and join as comma-separated
  const initialParticipantsInput = (() => {
    try {
      const parsedParticipants = JSON.parse(initialTripData.participants || '[]');
      return Array.isArray(parsedParticipants) ? parsedParticipants.join(', ') : '';
    } catch (e) {
      console.error('Error parsing participants:', e);
      return '';
    }
  })();
  
  const [participantsInput, setParticipantsInput] = useState(initialParticipantsInput);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Update image preview when image URL changes
  useEffect(() => {
    if (tripForm.image) {
      setImagePreview(tripForm.image);
    } else {
      setImagePreview(null);
    }
  }, [tripForm.image]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!tripForm.name?.trim()) {
      errors.name = 'Trip name is required';
    }

    if (!tripForm.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!tripForm.endDate) {
      errors.endDate = 'End date is required';
    }

    if (tripForm.startDate && tripForm.endDate) {
      const start = new Date(tripForm.startDate);
      const end = new Date(tripForm.endDate);

      if (start > end) {
        errors.endDate = 'End date must be after start date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Parse the comma-separated participants into an array and store as JSON
      const participants = participantsInput
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item);

      const updatedTrip = {
        ...tripForm,
        participants: JSON.stringify(participants),
      };

      await tripsApi.updateTrip(initialTripData.id, updatedTrip);
      toast.success('Trip updated successfully');
      router.push(`/trips/${initialTripData.id}`);
    } catch (error) {
      console.error('Error updating trip:', error);
      setError('Failed to update trip. Please try again.');
      toast.error('Failed to update trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTripForm({
      ...tripForm,
      [name]: value,
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          href={`/trips/${initialTripData.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Trip Details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Trip</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Trip Name*</Label>
              <Input
                id="name"
                name="name"
                value={tripForm.name || ''}
                onChange={handleInputChange}
                placeholder="Enter trip name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={tripForm.description || ''}
                onChange={handleInputChange}
                placeholder="Describe your trip"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date*</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={tripForm.startDate || ''}
                  onChange={handleInputChange}
                />
                {validationErrors.startDate && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date*</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={tripForm.endDate || ''}
                  onChange={handleInputChange}
                  min={tripForm.startDate || ''}
                />
                {validationErrors.endDate && (
                  <p className="text-red-500 text-sm">
                    {validationErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">
                Participants (comma-separated names)
              </Label>
              <Input
                id="participants"
                value={participantsInput}
                onChange={(e) => setParticipantsInput(e.target.value)}
                placeholder="John, Jane, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                name="image"
                value={tripForm.image || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <Image
                    src={imagePreview}
                    alt="Trip"
                    width={400}
                    height={225}
                    className="rounded-md object-cover"
                    onError={() => setImagePreview(null)}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/trips/${initialTripData.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Trip'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

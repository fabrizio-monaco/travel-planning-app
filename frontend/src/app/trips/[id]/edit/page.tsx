'use client';

import React, { useState, useEffect, FormEvent } from 'react'; // Import React for future use of React.use()
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

export default function EditTripPage({ params }: { params: { id: string } }) {
  // Extract id from params to avoid direct access warning
  // In future versions of Next.js, you'll need to use React.use()
  const { id } = params;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tripForm, setTripForm] = useState<Partial<Trip>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    image: '',
    participants: '[]',
  });
  const [participantsInput, setParticipantsInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  // Update image preview when image URL changes
  useEffect(() => {
    if (tripForm.image) {
      setImagePreview(tripForm.image);
    } else {
      setImagePreview(null);
    }
  }, [tripForm.image]);
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const trip = await tripsApi.getTripById(id);

      // Format dates for input fields
      const formattedTrip = {
        ...trip,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
      };

      setTripForm(formattedTrip);

      // Parse the participants from the JSON string and join as comma-separated
      try {
        const parsedParticipants = JSON.parse(trip.participants || '[]');
        if (Array.isArray(parsedParticipants)) {
          setParticipantsInput(parsedParticipants.join(', '));
        } else {
          setParticipantsInput('');
        }
      } catch (e) {
        setParticipantsInput('');
        console.error('Error parsing participants:', e);
      }
    } catch (error) {
      setError('Failed to load trip details. Please try again later.');
      toast.error('Failed to load trip details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    } else if (tripForm.startDate && tripForm.endDate < tripForm.startDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (tripForm.image && !isValidUrl(tripForm.image)) {
      errors.image = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show error toast for the first validation error
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || 'Please fix the validation errors');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Parse participants from comma-separated input
      const participantsArray = participantsInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== ''); // Send the update with participants as a JSON string to match Trip type
      await tripsApi.updateTrip(id, {
        name: tripForm.name,
        description: tripForm.description,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        image: tripForm.image,
        participants: JSON.stringify(participantsArray),
      });

      toast.success('Trip updated successfully');
      router.push(`/trips/${id}`);
    } catch (error) {
      setError('Failed to update trip. Please try again.');
      toast.error('Failed to update trip');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTripForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const renderErrorMessage = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-sm text-red-500 mt-1">{validationErrors[fieldName]}</p>
    ) : null;
  };

  if (loading) {
    return (
      <div className="py-8">
        <Card>
          <CardHeader>
            <CardTitle className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !tripForm.name) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-medium text-gray-600">
          Failed to load trip
        </h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button onClick={fetchTripDetails}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Trip</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                name="name"
                value={tripForm.name}
                onChange={handleInputChange}
                required
                aria-invalid={!!validationErrors.name}
                aria-describedby={
                  validationErrors.name ? 'name-error' : undefined
                }
              />
              {renderErrorMessage('name')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={tripForm.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={tripForm.startDate}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!validationErrors.startDate}
                  aria-describedby={
                    validationErrors.startDate ? 'startDate-error' : undefined
                  }
                />
                {renderErrorMessage('startDate')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={tripForm.endDate}
                  onChange={handleInputChange}
                  min={tripForm.startDate}
                  required
                  aria-invalid={!!validationErrors.endDate}
                  aria-describedby={
                    validationErrors.endDate ? 'endDate-error' : undefined
                  }
                />
                {renderErrorMessage('endDate')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                name="image"
                value={tripForm.image || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                aria-invalid={!!validationErrors.image}
                aria-describedby={
                  validationErrors.image ? 'image-error' : undefined
                }
              />
              {renderErrorMessage('image')}

              {imagePreview && (
                <div className="mt-2 rounded-md overflow-hidden border border-gray-200">
                  <div className="relative h-40 w-full">
                    <Image
                      src={imagePreview}
                      alt="Trip preview image"
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={() => {
                        setImagePreview(null);
                        setValidationErrors((prev) => ({
                          ...prev,
                          image:
                            'Unable to load this image. Please check the URL.',
                        }));
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">
                Participants (comma-separated)
              </Label>
              <Input
                id="participants"
                value={participantsInput}
                onChange={(e) => setParticipantsInput(e.target.value)}
                placeholder="John, Jane, Bob"
              />
              {participantsInput && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {participantsInput
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p !== '')
                    .map((participant, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-sm bg-gray-100 rounded-md"
                      >
                        {participant}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/trips/${params.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Trip'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

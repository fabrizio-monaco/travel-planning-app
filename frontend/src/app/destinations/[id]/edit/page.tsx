'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { destinationsApi } from '@/services/destinations-api';
import { Destination } from '@/types';

export default function EditDestinationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [destinationForm, setDestinationForm] = useState<Partial<Destination>>({
    name: '',
    description: '',
    activities: '[]',
    photos: '[]',
    latitude: undefined,
    longitude: undefined,
  });
  const [activitiesInput, setActivitiesInput] = useState('');
  const [photosInput, setPhotosInput] = useState('');

  useEffect(() => {
    fetchDestinationDetails();
  }, [params.id]);
  const fetchDestinationDetails = async () => {
    try {
      setLoading(true);
      const destination = await destinationsApi.getDestinationById(params.id);

      setDestinationForm(destination);

      // Parse activities from JSON string to array then join
      const activitiesArray = JSON.parse(destination.activities || '[]');
      setActivitiesInput(activitiesArray.join(', '));

      // Parse photos from JSON string to array then join
      const photosArray = JSON.parse(destination.photos || '[]');
      setPhotosInput(photosArray.join(', '));
    } catch (error) {
      toast.error('Failed to load destination details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Parse activities from comma-separated inputs
      const activitiesArray = activitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a !== '');

      // Convert activities array to JSON string to match backend expectations
      const activitiesJson = JSON.stringify(activitiesArray);

      // Parse photos from comma-separated inputs and convert to JSON string
      const photosArray = photosInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '');

      // Convert photos array to JSON string
      const photosJson = JSON.stringify(photosArray);

      // Only include necessary fields for the update request - avoid sending ID and other metadata
      await destinationsApi.updateDestination(params.id, {
        name: destinationForm.name,
        description: destinationForm.description,
        latitude: destinationForm.latitude,
        longitude: destinationForm.longitude,
        activities: activitiesJson,
        photos: photosJson,
      });

      toast.success('Destination updated successfully');
      router.push(`/destinations/${params.id}`);
    } catch (error) {
      toast.error('Failed to update destination');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'latitude' || name === 'longitude') {
      setDestinationForm((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value),
      }));
    } else {
      setDestinationForm((prev) => ({ ...prev, [name]: value }));
    }
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Destination</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Destination Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Destination Name</Label>
              <Input
                id="name"
                name="name"
                value={destinationForm.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={destinationForm.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities (comma-separated)</Label>
              <Input
                id="activities"
                value={activitiesInput}
                onChange={(e) => setActivitiesInput(e.target.value)}
                placeholder="Snorkeling, Swimming, Sunbathing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Photo URLs (comma-separated)</Label>
              <Input
                id="photos"
                value={photosInput}
                onChange={(e) => setPhotosInput(e.target.value)}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={
                    destinationForm.latitude !== undefined
                      ? destinationForm.latitude
                      : ''
                  }
                  onChange={handleInputChange}
                  placeholder="40.7128"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={
                    destinationForm.longitude !== undefined
                      ? destinationForm.longitude
                      : ''
                  }
                  onChange={handleInputChange}
                  placeholder="-74.0060"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/destinations/${params.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Destination'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';
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

export default function CreateDestinationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    description: '',
    activities: '',
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Parse activities from comma-separated inputs
      const activities = destinationForm.activities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a !== '');

      // Parse lat/lng if provided
      const latitude = destinationForm.latitude
        ? parseFloat(destinationForm.latitude)
        : undefined;
      const longitude = destinationForm.longitude
        ? parseFloat(destinationForm.longitude)
        : undefined;

      // Create the new destination
      const newDestination = await destinationsApi.createDestination({
        name: destinationForm.name,
        description: destinationForm.description,
        activities: JSON.stringify(activities),
        photos: JSON.stringify([]), // Empty array for photos
        latitude,
        longitude,
      });

      toast.success('Destination created successfully');
      router.push(`/destinations/${newDestination.id}`);
    } catch (error) {
      toast.error('Failed to create destination');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDestinationForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Destination</h1>
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
                placeholder="Maldives"
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
                placeholder="Beautiful island paradise..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities (comma-separated)</Label>
              <Input
                id="activities"
                name="activities"
                value={destinationForm.activities}
                onChange={handleInputChange}
                placeholder="Snorkeling, Swimming, Sunbathing"
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
                  value={destinationForm.latitude}
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
                  value={destinationForm.longitude}
                  onChange={handleInputChange}
                  placeholder="-74.0060"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/destinations">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Destination'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

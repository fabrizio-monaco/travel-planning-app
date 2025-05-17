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
import { tripsApi } from '@/services/trips-api';

export default function CreateTripPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tripForm, setTripForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    image: '',
    participants: '',
  });
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Parse participants from comma-separated input
      const participantsArray = tripForm.participants
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '');

      // Stringify the array to save as JSON string
      const participants = JSON.stringify(participantsArray);

      // Create the new trip
      const newTrip = await tripsApi.createTrip({
        name: tripForm.name,
        description: tripForm.description,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        image: tripForm.image || undefined,
        participants,
      });

      toast.success('Trip created successfully');
      router.push(`/trips/${newTrip.id}`);
    } catch (error) {
      toast.error('Failed to create trip');
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
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Trip</h1>
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
                placeholder="Summer Vacation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={tripForm.description}
                onChange={handleInputChange}
                placeholder="A relaxing trip to the beach..."
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
                />
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                name="image"
                value={tripForm.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">
                Participants (comma-separated)
              </Label>
              <Input
                id="participants"
                name="participants"
                value={tripForm.participants}
                onChange={handleInputChange}
                placeholder="John, Jane, Bob"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/trips">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Trip'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

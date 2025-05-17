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
import { tripsApi } from '@/services/trips-api';
import { Trip } from '@/types';

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tripForm, setTripForm] = useState<Partial<Trip>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    image: '',
    participants: '[]',
  });
  const [participantsInput, setParticipantsInput] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [params.id]);
  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const trip = await tripsApi.getTripById(params.id);

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
      toast.error('Failed to load trip details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Parse participants from comma-separated input
      const participantsArray = participantsInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '');

      // Send the update with participants as a JSON string to match Trip type
      await tripsApi.updateTrip(params.id, {
        name: tripForm.name,
        description: tripForm.description,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        image: tripForm.image,
        participants: JSON.stringify(participantsArray),
      });

      toast.success('Trip updated successfully');
      router.push(`/trips/${params.id}`);
    } catch (error) {
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
              />
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
                value={tripForm.image || ''}
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
                value={participantsInput}
                onChange={(e) => setParticipantsInput(e.target.value)}
                placeholder="John, Jane, Bob"
              />
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { destinationsApi } from '@/services/destinations-api';
import { Destination } from '@/types';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from '@/components/delete-confirmation-dialog';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState<
    Destination[]
  >([]);
  const { isDialogOpen, confirmDelete, handleConfirm, handleClose } =
    useDeleteConfirmation();

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = destinations.filter((destination) => {
        // Handle activities which might be a string or an array
        const activitiesArray: string[] = Array.isArray(destination.activities)
          ? destination.activities
          : typeof destination.activities === 'string'
          ? JSON.parse(destination.activities)
          : [];

        return (
          destination.name.toLowerCase().includes(query) ||
          destination.description.toLowerCase().includes(query) ||
          activitiesArray.some((activity: string) =>
            activity.toLowerCase().includes(query)
          )
        );
      });
      setFilteredDestinations(filtered);
    }
  }, [searchQuery, destinations]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationsApi.getAllDestinations();
      setDestinations(data);
      setFilteredDestinations(data);
    } catch (error) {
      toast.error('Failed to load destinations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        await destinationsApi.deleteDestination(id);
        toast.success('Destination deleted successfully');
        fetchDestinations();
      } catch (error) {
        toast.error('Failed to delete destination');
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Destinations</h1>
        <Button asChild>
          <Link href="/destinations/new">Create New Destination</Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSearchQuery('')}
          disabled={!searchQuery}
        >
          Clear
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-100"></div>
              <CardHeader className="h-16 bg-gray-50"></CardHeader>
              <CardContent className="h-24 bg-gray-50"></CardContent>
              <CardFooter className="h-12 bg-gray-100"></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-600">
            No destinations found
          </h3>
          {searchQuery ? (
            <p className="text-gray-500 mt-1">Try a different search term</p>
          ) : (
            <p className="text-gray-500 mt-1">
              Start by creating a new destination
            </p>
          )}
          {!searchQuery && (
            <Button className="mt-4" asChild>
              <Link href="/destinations/new">Create New Destination</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="overflow-hidden flex flex-col"
            >
              <CardHeader>
                <CardTitle>{destination.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="line-clamp-2 text-gray-600 mb-3">
                  {destination.description}
                </p>

                {(() => {
                  let activities: string[] = [];

                  try {
                    if (destination.activities) {
                      activities = Array.isArray(destination.activities)
                        ? destination.activities
                        : JSON.parse(destination.activities);
                    }
                  } catch (e) {
                    console.error('Invalid activities format', e);
                  }
                  return (
                    activities.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Activities:
                        </p>{' '}
                        <div className="flex flex-wrap gap-1">
                          {activities
                            .slice(0, 3)
                            .map((activity: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {activity}
                              </Badge>
                            ))}
                          {activities.length > 3 && (
                            <Badge variant="outline">
                              +{activities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}
              </CardContent>

              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/destinations/${destination.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(destination.id)}
                >
                  Delete
                </Button>{' '}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Destination"
        description="Are you sure you want to delete this destination? This action cannot be undone."
      />
    </div>
  );
}

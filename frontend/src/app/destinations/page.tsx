'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Destination, destinationApi } from '@/lib/api';
import { getErrorMessage, truncateText } from '@/lib/utils';
import { toast } from 'sonner';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    try {
      setLoading(true);
      setError(null);
      const data = await destinationApi.getAll();
      setDestinations(data);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return;
    }
    
    try {
      setLoading(true);
      await destinationApi.delete(id);
      setDestinations(destinations.filter(dest => dest.id !== id));
      toast.success('Destination deleted successfully');
    } catch (err) {
      toast.error(`Failed to delete destination: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Destinations</h1>
        <Button size="sm" asChild>
          <Link href="/destinations/new">New Destination</Link>
        </Button>
      </div>
      
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading destinations...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={loadDestinations}
          >
            Retry
          </Button>
        </div>
      )}
      
      {!loading && !error && destinations.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
          <h2 className="text-xl font-medium mb-2">No destinations found</h2>
          <p className="text-gray-500 mb-4">Create your first destination to get started.</p>
          <Button asChild>
            <Link href="/destinations/new">Create a Destination</Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <Card key={destination.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <Link href={`/destinations/${destination.id}`} className="hover:underline">
                  {destination.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{truncateText(destination.description, 100)}</p>
              
              {destination.activities && destination.activities.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Activities:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {destination.activities.map((activity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {destination.latitude && destination.longitude && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Coordinates: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/destinations/${destination.id}`}>View Details</Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/destinations/${destination.id}/edit`}>Edit</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(destination.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

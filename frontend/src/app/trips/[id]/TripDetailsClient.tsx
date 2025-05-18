'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FuelStations } from '@/components/fuel-stations';
import { tripsApi } from '@/services/trips-api';
import { packingItemsApi } from '@/services/packing-items-api';
import { destinationsApi } from '@/services/destinations-api';
import { Trip, Destination, PackingItem, FuelStation } from '@/types';
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from '@/components/delete-confirmation-dialog';

interface TripDetailsClientProps {
  initialTripData: Trip;
  initialPackingItems: PackingItem[];
  availableDestinations: Destination[];
}

export default function TripDetailsClient({
  initialTripData,
  initialPackingItems,
  availableDestinations,
}: TripDetailsClientProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip>(initialTripData);
  const [packingItems, setPackingItems] =
    useState<PackingItem[]>(initialPackingItems);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinationStartDate, setDestinationStartDate] = useState('');
  const [destinationEndDate, setDestinationEndDate] = useState('');
  const [newPackingItem, setNewPackingItem] = useState({ name: '', amount: 1 });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<number>(1);

  // Delete confirmation dialogs
  const tripDeleteDialog = useDeleteConfirmation();
  const destinationRemoveDialog = useDeleteConfirmation();

  // Fuel stations state
  const [fuelStationsMap, setFuelStationsMap] = useState<
    Record<string, FuelStation[]>
  >({});
  const [loadingFuelStations, setLoadingFuelStations] = useState<
    Record<string, boolean>
  >({});
  const [fuelStationsError, setFuelStationsError] = useState<
    Record<string, string>
  >({});
  const [radiusSettings, setRadiusSettings] = useState<Record<string, number>>(
    () => {
      // Initialize radius settings for each destination
      const initialRadiusSettings: Record<string, number> = {};
      if (initialTripData.tripToDestinations?.length) {
        initialTripData.tripToDestinations.forEach((td) => {
          if (td.destination?.id) {
            initialRadiusSettings[td.destination.id] = 5000;
          }
        });
      }
      return initialRadiusSettings;
    }
  );

  const handleAddDestination = async () => {
    if (!selectedDestination || !destinationStartDate || !destinationEndDate) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      await tripsApi.addDestinationToTrip(trip.id, selectedDestination, {
        startDate: destinationStartDate,
        endDate: destinationEndDate,
      });
      toast.success('Destination added to trip');

      // Fetch updated trip data
      const updatedTrip = await tripsApi.getTripById(trip.id, true);
      setTrip(updatedTrip);

      setSelectedDestination('');
      setDestinationStartDate('');
      setDestinationEndDate('');
    } catch (error) {
      toast.error('Failed to add destination');
      console.error(error);
    }
  };

  const handleRemoveDestination = (destinationId: string) => {
    destinationRemoveDialog.confirmDelete(async () => {
      try {
        await tripsApi.removeDestinationFromTrip(trip.id, destinationId);
        toast.success('Destination removed from trip');

        // Fetch updated trip data
        const updatedTrip = await tripsApi.getTripById(trip.id, true);
        setTrip(updatedTrip);
      } catch (error) {
        toast.error('Failed to remove destination');
        console.error(error);
      }
    });
  };

  const handleAddPackingItem = async () => {
    if (!newPackingItem.name) {
      toast.error('Please enter an item name');
      return;
    }

    try {
      await packingItemsApi.createPackingItem({
        name: newPackingItem.name,
        amount: newPackingItem.amount,
        tripId: trip.id,
      });
      toast.success('Packing item added');
      setNewPackingItem({ name: '', amount: 1 });

      const updatedItems = await packingItemsApi.getPackingItemsForTrip(
        trip.id
      );
      setPackingItems(updatedItems);
    } catch (error) {
      toast.error('Failed to add packing item');
      console.error(error);
    }
  };

  const handleDeletePackingItem = async (id: string) => {
    try {
      await packingItemsApi.deletePackingItem(id);
      toast.success('Item removed');
      const updatedItems = await packingItemsApi.getPackingItemsForTrip(
        trip.id
      );
      setPackingItems(updatedItems);
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    }
  };

  // Start editing a packing item
  const handleEditPackingItem = (item: PackingItem) => {
    setEditingItemId(item.id);
    setEditingAmount(item.amount);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  // Save updated packing item amount
  const handleSavePackingItem = async (id: string) => {
    try {
      await packingItemsApi.updatePackingItem(id, { amount: editingAmount });
      toast.success('Amount updated');

      // Reset edit state
      setEditingItemId(null);

      // Refresh the list
      const updatedItems = await packingItemsApi.getPackingItemsForTrip(
        trip.id
      );
      setPackingItems(updatedItems);
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    }
  };

  // Function to fetch fuel stations for a destination
  const fetchFuelStations = async (
    destinationId: string,
    radius: number = 5000
  ) => {
    if (!destinationId) return;

    try {
      // Update loading state for this destination
      setLoadingFuelStations((prev) => ({ ...prev, [destinationId]: true }));
      setFuelStationsError((prev) => ({ ...prev, [destinationId]: '' }));

      const response = await destinationsApi.getFuelStations(
        destinationId,
        radius
      );

      // Update fuel stations for this destination
      setFuelStationsMap((prev) => ({
        ...prev,
        [destinationId]: response.data || [],
      }));

      // Handle empty results
      if (response.data?.length === 0) {
        setFuelStationsError((prev) => ({
          ...prev,
          [destinationId]: `No fuel stations found within ${radius / 1000} km`,
        }));
      }
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err && typeof err === 'object' && 'message' in err
          ? err.message
          : 'An unknown error occurred';

      setFuelStationsError((prev) => ({
        ...prev,
        [destinationId]: errorMessage,
      }));
    } finally {
      setLoadingFuelStations((prev) => ({ ...prev, [destinationId]: false }));
    }
  };

  // Handle radius change for a destination
  const handleRadiusChange = (destinationId: string, value: number[]) => {
    setRadiusSettings((prev) => ({ ...prev, [destinationId]: value[0] }));
  };

  // Trigger search for a destination with the new radius
  const handleSearch = (destinationId: string) => {
    const radius = radiusSettings[destinationId] || 5000;
    fetchFuelStations(destinationId, radius);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate filtered destinations (available destinations not already in the trip)
  const tripDestinationIds =
    trip.tripToDestinations?.map((td) => td.destinationId) || [];
  const filteredDestinations = availableDestinations.filter(
    (d) => !tripDestinationIds.includes(d.id)
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="text-gray-500 mt-1">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/trips/${trip.id}/edit`}>Edit Trip</Link>
          </Button>{' '}
          <Button
            variant="destructive"
            onClick={() => {
              tripDeleteDialog.confirmDelete(() => {
                tripsApi
                  .deleteTrip(trip.id)
                  .then(() => {
                    toast.success('Trip deleted successfully');
                    router.push('/trips');
                  })
                  .catch((err) => {
                    toast.error('Failed to delete trip');
                    console.error(err);
                  });
              });
            }}
          >
            Delete Trip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{trip.description}</p>

              <div className="mt-4">
                <h4 className="font-medium">Participants</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(() => {
                    try {
                      const participants = JSON.parse(trip.participants);
                      if (
                        !Array.isArray(participants) ||
                        participants.length === 0
                      ) {
                        return (
                          <span className="text-gray-500 text-sm">
                            No participants yet.
                          </span>
                        );
                      }

                      return participants.map((participant, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {participant}
                        </span>
                      ));
                    } catch (e) {
                      return (
                        <span className="text-red-500 text-sm">
                          Invalid participant data.
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Destinations</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Add Destination</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Destination to Trip</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label
                        htmlFor="destination-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select Destination
                      </label>
                      <select
                        id="destination-select"
                        className="w-full p-2 border rounded-md"
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                      >
                        <option value="">Select a destination</option>
                        {filteredDestinations.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="start-date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Date
                      </label>
                      <Input
                        id="start-date"
                        type="date"
                        value={destinationStartDate}
                        onChange={(e) =>
                          setDestinationStartDate(e.target.value)
                        }
                        min={trip.startDate}
                        max={trip.endDate}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="end-date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Date
                      </label>
                      <Input
                        id="end-date"
                        type="date"
                        value={destinationEndDate}
                        onChange={(e) => setDestinationEndDate(e.target.value)}
                        min={destinationStartDate || trip.startDate}
                        max={trip.endDate}
                      />
                    </div>
                    <Button className="w-full" onClick={handleAddDestination}>
                      Add Destination
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>{' '}
            <CardContent>
              {trip.tripToDestinations && trip.tripToDestinations.length > 0 ? (
                <div className="space-y-4">
                  {trip.tripToDestinations.map((tripDestination) => {
                    const destination = tripDestination.destination;
                    if (!destination) return null;

                    return (
                      <Card key={destination.id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <Link
                              href={`/destinations/${destination.id}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {destination.name}
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleRemoveDestination(destination.id)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          {' '}
                          <div className="text-sm text-gray-500">
                            Stay: {formatDate(tripDestination.startDate)} -{' '}
                            {formatDate(tripDestination.endDate)}
                          </div>{' '}
                          <p className="mt-2 text-sm line-clamp-2">
                            {destination.description}
                          </p>
                          {destination.activities && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">
                                Activities:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  try {
                                    const activities = JSON.parse(
                                      destination.activities || '[]'
                                    );
                                    if (
                                      Array.isArray(activities) &&
                                      activities.length > 0
                                    ) {
                                      return activities.map(
                                        (activity, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                          >
                                            {activity}
                                          </span>
                                        )
                                      );
                                    }
                                    return null;
                                  } catch (e) {
                                    console.error(
                                      'Error parsing activities:',
                                      e
                                    );
                                    return null;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          {/* Fuel Stations Section */}
                          {destination.latitude && destination.longitude && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">
                                  Nearby Fuel Stations
                                </h4>
                                {loadingFuelStations[destination.id] && (
                                  <span className="text-xs text-gray-500">
                                    Loading...
                                  </span>
                                )}
                              </div>

                              {/* Radius Selection */}
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between items-center">
                                  <Label
                                    htmlFor={`radius-slider-${destination.id}`}
                                    className="text-xs"
                                  >
                                    Radius:{' '}
                                    {(
                                      (radiusSettings[destination.id] || 5000) /
                                      1000
                                    ).toFixed(1)}{' '}
                                    km
                                  </Label>
                                  <span className="text-xs text-gray-500">
                                    (max 20 km)
                                  </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Slider
                                    id={`radius-slider-${destination.id}`}
                                    min={1000}
                                    max={20000}
                                    step={1000}
                                    value={[
                                      radiusSettings[destination.id] || 5000,
                                    ]}
                                    onValueChange={(value) =>
                                      handleRadiusChange(destination.id, value)
                                    }
                                    disabled={
                                      loadingFuelStations[destination.id]
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSearch(destination.id)}
                                    disabled={
                                      loadingFuelStations[destination.id]
                                    }
                                  >
                                    {loadingFuelStations[destination.id]
                                      ? 'Searching...'
                                      : 'Search'}
                                  </Button>
                                </div>
                              </div>

                              {/* Fuel Stations Results */}
                              {fuelStationsError[destination.id] && (
                                <p className="text-xs text-red-500 mb-2">
                                  {fuelStationsError[destination.id]}
                                </p>
                              )}

                              {fuelStationsMap[destination.id]?.length > 0 ? (
                                <FuelStations
                                  stations={fuelStationsMap[destination.id]}
                                />
                              ) : (
                                !fuelStationsMap[destination.id] &&
                                !fuelStationsError[destination.id] &&
                                !loadingFuelStations[destination.id] && (
                                  <p className="text-xs text-gray-500 text-center py-2">
                                    Use the search button to find nearby fuel
                                    stations
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No destinations added to this trip yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Packing List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Item name"
                  value={newPackingItem.name}
                  onChange={(e) =>
                    setNewPackingItem({
                      ...newPackingItem,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  className="w-20"
                  min="1"
                  value={newPackingItem.amount}
                  onChange={(e) =>
                    setNewPackingItem({
                      ...newPackingItem,
                      amount: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <Button size="sm" onClick={handleAddPackingItem}>
                  Add
                </Button>
              </div>

              <Separator className="my-4" />

              {packingItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-24">Amount</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>{' '}
                        <TableCell>
                          {editingItemId === item.id ? (
                            <Input
                              type="number"
                              className="w-20 h-8 text-sm"
                              min="1"
                              value={editingAmount}
                              onChange={(e) =>
                                setEditingAmount(parseInt(e.target.value) || 1)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSavePackingItem(item.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-blue-500"
                              onClick={() => handleEditPackingItem(item)}
                              title="Click to edit"
                            >
                              {item.amount}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1 justify-end">
                            {editingItemId === item.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600"
                                  onClick={() => handleSavePackingItem(item.id)}
                                  title="Save"
                                >
                                  ✓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-500"
                                  onClick={handleCancelEdit}
                                  title="Cancel"
                                >
                                  ✗
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600"
                                  onClick={() => handleEditPackingItem(item)}
                                  title="Edit amount"
                                >
                                  ✎
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() =>
                                    handleDeletePackingItem(item.id)
                                  }
                                  title="Delete"
                                >
                                  ✕
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No items added yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>{' '}
      </div>

      {/* Trip Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={tripDeleteDialog.isDialogOpen}
        onClose={tripDeleteDialog.handleClose}
        onConfirm={tripDeleteDialog.handleConfirm}
        title="Delete Trip"
        description="Are you sure you want to delete this trip? This action cannot be undone."
      />

      {/* Destination Remove Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={destinationRemoveDialog.isDialogOpen}
        onClose={destinationRemoveDialog.handleClose}
        onConfirm={destinationRemoveDialog.handleConfirm}
        title="Remove Destination"
        description="Are you sure you want to remove this destination from the trip?"
      />
    </div>
  );
}

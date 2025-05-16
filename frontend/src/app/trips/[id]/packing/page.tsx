'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trip, PackingItem, tripApi, packingItemApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface PackingPageProps {
  params: {
    id: string; // Trip ID
  };
}

export default function PackingPage({ params }: PackingPageProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tripData = await tripApi.getById(params.id);
      setTrip(tripData);
      
      const packingData = await packingItemApi.getByTrip(params.id);
      setPackingItems(packingData);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddItem() {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    
    try {
      const newItem = await packingItemApi.create({
        name: newItemName.trim(),
        amount: newItemAmount,
        tripId: params.id,
      });
      
      setPackingItems([...packingItems, newItem]);
      setNewItemName('');
      setNewItemAmount(1);
      toast.success('Item added successfully');
    } catch (err) {
      toast.error(`Failed to add item: ${getErrorMessage(err)}`);
    }
  }

  async function handleUpdateAmount(id: string, amount: number) {
    try {
      await packingItemApi.update(id, { amount });
      
      setPackingItems(packingItems.map(item => 
        item.id === id ? { ...item, amount } : item
      ));
      toast.success('Item updated');
    } catch (err) {
      toast.error(`Failed to update item: ${getErrorMessage(err)}`);
    }
  }

  async function handleDeleteItem(id: string) {
    try {
      await packingItemApi.delete(id);
      setPackingItems(packingItems.filter(item => item.id !== id));
      toast.success('Item deleted');
    } catch (err) {
      toast.error(`Failed to delete item: ${getErrorMessage(err)}`);
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Are you sure you want to delete all packing items?')) {
      return;
    }
    
    try {
      await packingItemApi.deleteByTrip(params.id);
      setPackingItems([]);
      toast.success('All items deleted');
    } catch (err) {
      toast.error(`Failed to delete items: ${getErrorMessage(err)}`);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading packing list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={loadData}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-2">Trip not found</h2>
        <p className="text-gray-500 mb-4">The trip you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <Link href="/trips" className="text-gray-500 hover:text-gray-700">
            Trips
          </Link>
          <span className="text-gray-500">/</span>
          <Link href={`/trips/${trip.id}`} className="text-gray-500 hover:text-gray-700">
            {trip.name}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium">Packing List</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Packing List for {trip.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            {packingItems.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                Delete All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {packingItems.length > 0 ? (
              <div className="space-y-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-1">Item</th>
                      <th className="text-center py-2 px-1 w-32">Amount</th>
                      <th className="text-right py-2 px-1 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packingItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-1">{item.name}</td>
                        <td className="py-2 px-1">
                          <div className="flex items-center justify-center">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-7 w-7" 
                              onClick={() => item.amount > 1 && handleUpdateAmount(item.id, item.amount - 1)}
                              disabled={item.amount <= 1}
                            >
                              -
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.amount}</span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateAmount(item.id, item.amount + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No items added to your packing list yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input 
                  id="item-name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Sunscreen"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-amount">Amount</Label>
                <Input 
                  id="item-amount"
                  type="number"
                  min="1"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <Button 
                onClick={handleAddItem} 
                disabled={!newItemName.trim()}
                className="w-full"
              >
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href={`/trips/${trip.id}`}>Back to Trip</Link>
        </Button>
      </div>
    </div>
  );
}

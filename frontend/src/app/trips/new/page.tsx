'use client';

import Link from 'next/link';
import { TripForm } from '@/components/trip-form';

export default function NewTripPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <Link href="/trips" className="text-gray-500 hover:text-gray-700">
            Trips
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium">Create New Trip</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Create New Trip</h1>
      </div>
      
      <TripForm />
    </div>
  );
}

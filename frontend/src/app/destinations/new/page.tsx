'use client';

import Link from 'next/link';
import { DestinationForm } from '@/components/destination-form';

export default function NewDestinationPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          <Link href="/destinations" className="text-gray-500 hover:text-gray-700">
            Destinations
          </Link>
          <span className="text-gray-500">/</span>
          <span className="font-medium">Create New Destination</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">Create New Destination</h1>
      </div>
      
      <DestinationForm />
    </div>
  );
}

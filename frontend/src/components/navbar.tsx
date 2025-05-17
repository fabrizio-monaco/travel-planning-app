import Link from 'next/link';
import { Button } from './ui/button';

export function Navbar() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-blue-600">
            Travel Planner
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/trips"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Trips
            </Link>
            <Link
              href="/destinations"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Destinations
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trips/new">New Trip</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/destinations/new">New Destination</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

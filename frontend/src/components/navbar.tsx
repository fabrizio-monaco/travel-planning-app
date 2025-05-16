import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <Link href="/" className="font-bold text-xl">
          Travel Planner
        </Link>
        
        <nav className="flex gap-6">
          <Link href="/trips" className="font-medium hover:text-primary transition-colors">
            Trips
          </Link>
          <Link href="/destinations" className="font-medium hover:text-primary transition-colors">
            Destinations
          </Link>
        </nav>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/trips/new">New Trip</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/destinations/new">New Destination</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

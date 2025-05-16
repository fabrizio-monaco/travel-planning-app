import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="py-12 text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to Travel Planner</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Plan and manage all your trips in one place. Organize destinations, pack smartly, 
          and make the most of your travel experiences.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <Button size="lg" asChild>
            <Link href="/trips">View Your Trips</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/destinations">Explore Destinations</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Trips</CardTitle>
            <CardDescription>
              Organize all your travel experiences in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image 
              src="/file.svg"
              width={120}
              height={120}
              alt="Trips icon"
              className="h-24 w-24 text-gray-400"
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/trips">Manage Trips</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinations</CardTitle>
            <CardDescription>
              Discover and save places you want to visit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image 
              src="/globe.svg"
              width={120}
              height={120}
              alt="Destinations icon"
              className="h-24 w-24 text-gray-400"
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/destinations">View Destinations</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="pt-8 pb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Trip Management</h3>
            <p className="text-gray-500">
              Create, edit, and organize all your trips with detailed information.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Destination Library</h3>
            <p className="text-gray-500">
              Build a collection of places you've visited or want to visit.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Packing Lists</h3>
            <p className="text-gray-500">
              Never forget essential items with trip-specific packing lists.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

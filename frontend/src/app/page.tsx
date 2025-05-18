import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Map,
  PackageOpen,
  ChevronRight,
  Globe,
  Plane,
  Calendar,
  CheckCircle,
  ArrowRight,
  MapPin,
} from 'lucide-react';

// Import island image
import islandImage from '@/assets/island.jpeg';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section with background image */}
      <section className="relative -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background z-10"></div>
          <Image
            src={islandImage}
            alt="Tropical island destination"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-8 py-20">
          <div
            className="animate-fadeIn opacity-0"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            <Badge className="mb-4 py-1.5 px-6 text-md font-normal bg-primary/20 text-primary border-primary/30 backdrop-blur">
              Your Personal Journey Assistant
            </Badge>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-tight animate-fadeIn opacity-0"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            Plan Your Dream <span className="text-primary">Adventures</span>{' '}
            With Ease
          </h1>

          <p
            className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto animate-fadeIn opacity-0"
            style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
          >
            Organize destinations, create itineraries, and track all your travel
            essentials in one beautiful platform.
          </p>

          <div
            className="flex flex-wrap justify-center gap-4 mt-8 animate-fadeIn opacity-0"
            style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
          >
            <Button
              size="lg"
              className="gap-2 rounded-full text-md h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              asChild
            >
              <Link href="/trips">
                Start Planning Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full text-md h-12 px-8 border-2 hover:bg-background/50 backdrop-blur transition-all"
              asChild
            >
              <Link href="/destinations">
                Browse Destinations
                <Globe className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>{' '}
      {/* Features Grid */}
      <section className="container mx-auto pt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Explore Our Platform</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to make your travel planning experience seamless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <Card className="group overflow-hidden border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 z-0 group-hover:bg-primary/20 transition-all duration-300"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="bg-primary/15 p-3 rounded-xl group-hover:bg-primary/25 transition-colors duration-300 mr-2">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">Trip Planning</CardTitle>
                  <CardDescription className="text-base">
                    Create detailed itineraries for your adventures and keep all
                    your travel plans organized in one place.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-2">
              <ul className="space-y-2">
                {[
                  'Custom itineraries',
                  'Travel notes',
                  'Date organization',
                  'Trip sharing',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary/70" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="relative z-10">
              <Button
                className="w-full gap-2 bg-primary/90 hover:bg-primary shadow-md"
                asChild
              >
                <Link href="/trips">
                  Explore Trips
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="group overflow-hidden border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 z-0 group-hover:bg-primary/20 transition-all duration-300"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="bg-primary/15 p-3 rounded-xl group-hover:bg-primary/25 transition-colors duration-300 mr-2">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">Destinations</CardTitle>
                  <CardDescription className="text-base">
                    Discover and save your dream destinations, complete with
                    notes, photos, and location data.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-2">
              <ul className="space-y-2">
                {[
                  'Location tracking',
                  'Destination notes',
                  'Nearby services',
                  'Photo gallery',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary/70" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="relative z-10">
              <Button
                className="w-full gap-2 bg-primary/90 hover:bg-primary shadow-md"
                asChild
              >
                <Link href="/destinations">
                  Discover Places
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>{' '}
      {/* How it works section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-primary/5 rounded-3xl my-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">How Travel Planner Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your journey from dreaming to experiencing in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line between steps */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-primary/30 hidden md:block"></div>

          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/15 w-16 h-16 flex items-center justify-center rounded-full mb-6 relative z-10 border border-primary/30">
                <MapPin className="h-7 w-7 text-primary" />
                <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Choose Destinations
              </h3>
              <p className="text-muted-foreground">
                Browse and save all the beautiful places you want to visit in
                your personal destination library.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/15 w-16 h-16 flex items-center justify-center rounded-full mb-6 relative z-10 border border-primary/30">
                <Calendar className="h-7 w-7 text-primary" />
                <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Itineraries</h3>
              <p className="text-muted-foreground">
                Plan your perfect trip with customized itineraries, dates, and
                all travel details in one place.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/15 w-16 h-16 flex items-center justify-center rounded-full mb-6 relative z-10 border border-primary/30">
                <Plane className="h-7 w-7 text-primary" />
                <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enjoy Your Journey</h3>
              <p className="text-muted-foreground">
                Travel with confidence knowing all your plans are organized and
                accessible anywhere you go.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/trips/new">
              Start Your Journey Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      {/* Additional features section with grid */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Plan with Confidence</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover all the tools that make travel planning effortless
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Map className="h-8 w-8 text-primary" />,
              title: 'Trip Management',
              description:
                'Organize trips with detailed information and itineraries',
            },
            {
              icon: <Compass className="h-8 w-8 text-primary" />,
              title: 'Destination Library',
              description: 'Save and categorize all your dream destinations',
            },
            {
              icon: <PackageOpen className="h-8 w-8 text-primary" />,
              title: 'Packing Lists',
              description: 'Create customized packing lists for each journey',
            },
            {
              icon: <Globe className="h-8 w-8 text-primary" />,
              title: 'Local Insights',
              description: 'Find essential services at your destinations',
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="border border-border/40 hover:border-primary/30 transition-all hover:shadow-md bg-background/60"
            >
              <CardHeader>
                <div className="bg-primary/10 p-3 inline-block rounded-xl mb-2">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Call to action banner */}
      <section className="relative overflow-hidden rounded-3xl bg-primary/10 border border-primary/20 mb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.2)_0%,rgba(var(--primary-rgb),0)_70%)]"></div>
        <div className="relative z-10 px-6 py-12 sm:py-16 md:px-12 text-center sm:text-left sm:flex items-center justify-between">
          <div className="max-w-2xl mb-8 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Plan Your Next Adventure?
            </h2>
            <p className="text-lg text-foreground/80">
              Start creating beautiful memories with Travel Planner today
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-full px-8 bg-primary/90 hover:bg-primary shadow-md"
            asChild
          >
            <Link href="/trips/new">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

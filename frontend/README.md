# Travel Planner Frontend

This is the frontend application for the Travel Planner, a web application that allows users to manage trips, destinations, and packing lists.

## Features

- **Trip Management**:
  - View a list of all trips
  - View detailed information about a specific trip
  - Create, edit, and delete trips
  - Search trips by name or date
  - Add destinations to trips
  - Remove destinations from trips

- **Destination Management**:
  - View a list of all destinations
  - View detailed information about a specific destination
  - Create, edit, and delete destinations
  - View trips associated with a destination
  - View nearby fuel stations for destinations with geographic coordinates

- **Packing Lists**:
  - Manage packing items for trips
  - Add, update amounts, and remove items
  - Clear all items for a trip

## Technology Stack

- **Frontend**: React, Next.js, TypeScript
- **UI Components**: shadcn/ui component library
- **API Communication**: Fetch API

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js pages (App Router)
│   │   ├── destinations/
│   │   └── trips/
│   ├── components/     # Reusable components
│   │   ├── ui/         # shadcn UI components
│   │   ├── navbar.tsx
│   │   ├── search-bar.tsx
│   │   ├── trip-form.tsx
│   │   └── destination-form.tsx
│   └── lib/            # Utility functions and API services
│       ├── api.ts      # API service for backend communication
│       └── utils.ts    # Helper functions
```

## Getting Started

1. Make sure the backend server is running (default: http://localhost:5001)
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open your browser and navigate to http://localhost:3000

## API Communication

The frontend communicates with the backend API through the services defined in `src/lib/api.ts`:

- `tripApi`: Functions for managing trips
- `destinationApi`: Functions for managing destinations
- `packingItemApi`: Functions for managing packing items

## Pages

- `/`: Home page with overview of the application
- `/trips`: List of all trips
- `/trips/new`: Create a new trip
- `/trips/[id]`: View trip details
- `/trips/[id]/edit`: Edit trip
- `/trips/[id]/add-destination`: Add a destination to a trip
- `/trips/[id]/packing`: Manage trip packing list
- `/destinations`: List of all destinations
- `/destinations/new`: Create a new destination
- `/destinations/[id]`: View destination details
- `/destinations/[id]/edit`: Edit destination

## Features Implementation

### Trip Search

The trip search feature leverages the backend's `/trips/search` endpoint, which allows filtering by:
- Search term (name)
- Date range (start and end dates)

### Destination-Trip Relationship

The application implements the relationship between destinations and trips:
- A trip can have multiple destinations with specific visit dates
- A destination can be part of multiple trips
- The frontend displays all trips associated with a destination and vice versa

### Nearby Fuel Stations

For destinations with geographic coordinates (latitude and longitude), the application can display nearby fuel stations using the integrated Geoapify API from the backend.

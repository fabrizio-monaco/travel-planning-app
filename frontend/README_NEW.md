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
- **State Management**: React useState/useEffect hooks
- **Routing**: Next.js App Router
- **Notifications**: Sonner toast library

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

## API Service

The application communicates with a backend API using the service defined in `src/lib/api.ts`. This service provides the following features:

- Type definitions for Trip, Destination, PackingItem, and FuelStation
- Normalization functions to ensure consistent data structures
- CRUD operations for trips, destinations, and packing items
- Search functionality for trips
- Managing relationships between trips and destinations
- Fetching fuel stations near destinations

### Data Normalization

The application handles inconsistent data from the API by normalizing it using helper functions:

```typescript
// Example normalization:
const normalizeTrip = (trip: any): Trip => {
  if (!trip) return {} as Trip;
  
  return {
    ...trip,
    participants: Array.isArray(trip.participants) 
      ? trip.participants.map((p: any) => String(p)) 
      : typeof trip.participants === 'string'
        ? trip.participants.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [],
    // Additional normalization logic
  };
};
```

## Form Validation

The application implements client-side form validation for all creation and editing forms:

- Required field validation
- Date range validation
- Numeric value validation (for latitude/longitude)
- Geographic coordinates range validation

## Utility Functions

The `src/lib/utils.ts` file contains helper functions for:

- Date formatting and validation
- Error message extraction
- Text truncation
- Array handling
- Safe JSON parsing
- Geographic location formatting

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Backend API

The frontend expects a backend API running at `http://localhost:5001/api`. Make sure the backend is running before using the frontend application.

## Error Handling

The application handles errors with a consistent approach:

- Form validation errors are displayed inline with relevant form fields
- API errors are shown as toast notifications
- Network issues are gracefully handled with retry options
- Data inconsistencies are managed through normalization functions

# Travel Planner Application

A comprehensive application for planning and managing trips, destinations, and packing lists. This project consists of a backend RESTful API built with Node.js and a frontend web application built with Next.js.

## Project Overview

The Travel Planner allows users to:
- Create and manage trips with details like dates and participants
- Add destinations to trips with specific visit dates
- Build a library of destination information
- Create packing lists for trips
- Find fuel stations near destinations

## Project Structure

The project is organized into two main directories:

- `backend/`: Node.js RESTful API using Express
- `frontend/`: Next.js web application with React and TypeScript

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- SQLite with Drizzle ORM
- External API Integration (Geoapify for fuel stations)

### Frontend
- Next.js 14 with App Router
- React and TypeScript
- shadcn/ui component library
- Responsive design

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Running the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

The API will be available at http://localhost:5001/api

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The web application will be available at http://localhost:3000

## API Documentation

The backend provides a RESTful API with the following main endpoints:

### Trips
- `GET /api/trips`: Get all trips
- `GET /api/trips/:id`: Get a specific trip
- `POST /api/trips`: Create a new trip
- `PUT /api/trips/:id`: Update a trip
- `DELETE /api/trips/:id`: Delete a trip
- `GET /api/trips/search`: Search trips by name or date
- `GET /api/trips/by-destination/:destinationId`: Get trips by destination

### Destinations
- `GET /api/destinations`: Get all destinations
- `GET /api/destinations/:id`: Get a specific destination
- `POST /api/destinations`: Create a new destination
- `PUT /api/destinations/:id`: Update a destination
- `DELETE /api/destinations/:id`: Delete a destination
- `GET /api/destinations/:id/trips`: Get trips for a destination
- `GET /api/destinations/:destinationId/fuel-stations`: Get fuel stations near a destination

### Trip-Destination Relationships
- `POST /api/trips/:tripId/destinations/:destinationId`: Add destination to trip
- `PUT /api/trips/:tripId/destinations/:destinationId`: Update trip-destination relationship
- `DELETE /api/trips/:tripId/destinations/:destinationId`: Remove destination from trip

### Packing Items
- `GET /api/packing-items`: Get all packing items
- `GET /api/packing-items/:id`: Get a specific packing item
- `POST /api/packing-items`: Create a new packing item
- `PUT /api/packing-items/:id`: Update a packing item
- `DELETE /api/packing-items/:id`: Delete a packing item
- `GET /api/trips/:tripId/packing-items`: Get packing items for a trip
- `DELETE /api/trips/:tripId/packing-items`: Delete all packing items for a trip

For more details, refer to the Postman collection in the `backend/` folder.

## Frontend Features

### Trip Management
- List view with search functionality
- Detail view showing trip information and destinations
- Form for creating and editing trips

### Destination Management
- List view of all destinations
- Detail view showing destination information and associated trips
- Form for creating and editing destinations
- Integration with the Geoapify API to show nearby fuel stations

### Packing Lists
- Add, update, and remove items from trip-specific packing lists
- View all items for a trip

## Future Enhancements

- User authentication and authorization
- Photo upload capability for destinations
- Interactive maps for destinations
- Trip sharing functionality
- Mobile app version

## Contributors

- Student ID: 1117739

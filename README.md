# FWE-SS-25-1117739

# Travel Planning Application

## 🌟 Project Overview

Travel Planning is a comprehensive full-stack application developed for the FWE | SS 2025 course. It enables users to plan and organize their trips by managing destinations, keeping track of packing lists, and finding nearby fuel stations for their travel destinations. The application consists of a backend REST API built with Node.js, Express, and PostgreSQL, and a responsive frontend developed with React, Next.js, and TypeScript.

- Find fuel stations near destinations

## ✨ Features

### Core Features

#### Trip Management

- **CRUD Operations**: Create, read, update, and delete trips
- **Search Functionality**: Search trips by name or date range
- **Trip Details**: View comprehensive information about each trip including destinations, dates, and participants

#### Destination Management

- **CRUD Operations**: Create, read, update, and delete destinations
- **Detailed Information**: Store location information, activities, and photos
- **Geolocation Support**: Store latitude/longitude coordinates for destinations

#### Relationship Management

- **Trip-Destination Relationships**: Each trip can have 0..N destinations, and each destination can belong to 1..N trips
- **Add/Remove Destinations**: Add destinations to trips or remove them with custom date ranges
- **Related Trips View**: View all trips that include a specific destination

#### Frontend Integration

- **List/Detail Views**: Comprehensive views for trips and destinations
- **Search & Filter**: Advanced search capabilities in the frontend
- **Responsive Design**: Mobile-friendly interface
- **Interactive Forms**: User-friendly forms for creating and editing trips/destinations

### Freestyle Features

#### Packing Items Feature (Freestyle Task 1)

- **Trip-Specific Packing Lists**: Create and manage packing lists for each trip
- **Item Management**: Add, update amounts, and remove packing items
- **Bulk Operations**: Clear all packing items for a specific trip

#### Fuel Stations Feature (Freestyle Task 2)

- **Nearby Fuel Stations**: Find fuel stations near a destination using geographic coordinates
- **Station Details**: View detailed information about each fuel station
- **Configurable Radius**: Adjust search radius to find stations at various distances
- **Integration with Geoapify API**: Uses external API for real-time fuel station data

## 🛣️ API Routes

### Trip Routes

| Method   | URL                                        | Description               | Request Body                 | Response              |
| -------- | ------------------------------------------ | ------------------------- | ---------------------------- | --------------------- |
| `GET`    | `/api/trips`                               | Get all trips             | -                            | Array of trip objects |
| `GET`    | `/api/trips/:id`                           | Get a specific trip       | -                            | Trip object           |
| `POST`   | `/api/trips`                               | Create a new trip         | Trip data                    | Created trip          |
| `PUT`    | `/api/trips/:id`                           | Update a trip             | Trip data                    | Updated trip          |
| `DELETE` | `/api/trips/:id`                           | Delete a trip             | -                            | Success message       |
| `GET`    | `/api/trips/search`                        | Search trips by name/date | `?name=&startDate=&endDate=` | Array of trip objects |
| `GET`    | `/api/trips/by-destination/:destinationId` | Get trips by destination  | -                            | Array of trip objects |

### Trip-Destination Relationship Routes

| Method   | URL                                              | Description                  | Request Body   | Response             |
| -------- | ------------------------------------------------ | ---------------------------- | -------------- | -------------------- |
| `POST`   | `/api/trips/:tripId/destinations/:destinationId` | Add destination to trip      | Optional dates | Relationship object  |
| `PUT`    | `/api/trips/:tripId/destinations/:destinationId` | Update trip-destination      | Dates          | Updated relationship |
| `DELETE` | `/api/trips/:tripId/destinations/:destinationId` | Remove destination from trip | -              | Success message      |

### Destination Routes

| Method   | URL                           | Description                 | Request Body     | Response                     |
| -------- | ----------------------------- | --------------------------- | ---------------- | ---------------------------- |
| `GET`    | `/api/destinations`           | Get all destinations        | -                | Array of destination objects |
| `GET`    | `/api/destinations/:id`       | Get a specific destination  | -                | Destination object           |
| `POST`   | `/api/destinations`           | Create a destination        | Destination data | Created destination          |
| `PUT`    | `/api/destinations/:id`       | Update a destination        | Destination data | Updated destination          |
| `DELETE` | `/api/destinations/:id`       | Delete a destination        | -                | Success message              |
| `GET`    | `/api/destinations/:id/trips` | Get trips for a destination | -                | Array of trip objects        |

### Packing Item Routes

| Method   | URL                                | Description                         | Request Body | Response               |
| -------- | ---------------------------------- | ----------------------------------- | ------------ | ---------------------- |
| `GET`    | `/api/packing-items`               | Get all packing items               | -            | Array of packing items |
| `POST`   | `/api/packing-items`               | Create a packing item               | Item data    | Created packing item   |
| `GET`    | `/api/packing-items/:id`           | Get a specific packing item         | -            | Packing item object    |
| `PUT`    | `/api/packing-items/:id`           | Update a packing item               | Item data    | Updated packing item   |
| `DELETE` | `/api/packing-items/:id`           | Delete a packing item               | -            | Success message        |
| `GET`    | `/api/trips/:tripId/packing-items` | Get packing items for a trip        | -            | Array of packing items |
| `DELETE` | `/api/trips/:tripId/packing-items` | Delete all packing items for a trip | -            | Success message        |

### Fuel Station Routes

| Method | URL                                              | Description                          | Query Params   | Response                      |
| ------ | ------------------------------------------------ | ------------------------------------ | -------------- | ----------------------------- |
| `GET`  | `/api/destinations/:destinationId/fuel-stations` | Get fuel stations near a destination | `?radius=5000` | Array of fuel station objects |

## 🏗️ Frontend Structure

The frontend is built with Next.js (App Router) and organized as follows:

### Main Pages

- **Trip List Page (`/trips`)**: Displays all trips with search/filter capabilities
- **Trip Details Page (`/trips/:id`)**: Shows detailed information about a specific trip
- **Trip Creation Page (`/trips/new`)**: Form to create a new trip
- **Trip Edit Page (`/trips/:id/edit`)**: Form to edit an existing trip
- **Destination List Page (`/destinations`)**: Displays all destinations
- **Destination Details Page (`/destinations/:id`)**: Shows detailed information about a specific destination
- **Destination Creation Page (`/destinations/new`)**: Form to create a new destination
- **Destination Edit Page (`/destinations/:id/edit`)**: Form to edit an existing destination

### Key Components

- **Navbar**: Navigation bar for the application
- **Trip Card**: Display summary information for a trip
- **Destination Card**: Display summary information for a destination
- **Packing Item List**: Manage packing items for a trip
- **Fuel Stations**: Display and manage fuel stations near a destination
- **Forms**: Reusable forms for creating/editing trips and destinations
- **Delete Confirmation Dialog**: Confirmation dialog for delete operations

### Backend Integration

The frontend communicates with the backend API using typed service modules:

- `trips-api.ts`: Service for trip-related API calls
- `destinations-api.ts`: Service for destination-related API calls
- `packing-items-api.ts`: Service for packing item API calls

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (recommended) or npm

### Setting Up the Database

1. Create a PostgreSQL database for the application
2. Configure database connection in `.env` file (see example below)

### Installing Dependencies

```bash
# Install dependencies for both backend and frontend
pnpm install
```

### Configuration

Create a copy of the `.env.example` file in the root directory named `.env` and fill out the fields accordingly.

Make sure to fill out the Geoapify API Key which i sent you per mail.

```
GEOAPIFY_API_KEY=your_geoapify_api_key
```

### Installing Dependencies

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### Running the Application

```bash
# Start backend development server
cd backend
pnpm run dev
```

```bash
# In a separate terminal, start frontend development server
cd frontend
pnpm run dev
```


## 🧪 Testing the API

### Automated Tests

The project includes Jest tests for the backend API:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Postman Collection

A Postman collection is included in the repository:

- Location: `/backend/postman_collection.json`
- Import this file into Postman to test all API endpoints

## 💻 Tech Stack

### Backend

- **Framework**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Testing**: Jest
- **Validation**: Zod
- **External APIs**: Geoapify (for fuel stations data)

### Frontend

- **Framework**: React, Next.js (App Router)
- **Languages**: TypeScript
- **UI Components**: shadcn/ui
- **State Management**: React hooks
- **Styling**: Tailwind CSS

## 🚧 Future Improvements

- User authentication and authorization
- Photo upload capability for destinations
- Interactive maps for destinations
- Trip sharing functionality
- Mobile app version

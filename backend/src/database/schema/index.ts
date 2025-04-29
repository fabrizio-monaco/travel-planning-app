// !Import all database schemas - import * as xyz from is necessary
import * as destination from './destination.schema';
import * as trip from './trip.schema';
import * as tripToDestination from './trip-to-destination.schema';

export const databaseSchema = {
  ...destination,
  ...trip,
  ...tripToDestination,
};

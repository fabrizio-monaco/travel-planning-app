import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import { Database } from '../../src/database';
import { databaseSchema } from '../../src/database/schema';

export class TestDatabase {
  private container!: StartedPostgreSqlContainer;
  public database!: Database;
  private client!: Client;
  async setup() {
    // Use a more robust container configuration with increased timeouts and retry options
    this.container = await new PostgreSqlContainer()
      .withStartupTimeout(120000) // 2 minutes timeout
      .start();

    // Create a proper PostgreSQL client with timeout settings
    this.client = new Client({
      connectionString: this.container.getConnectionUri(),
      connectionTimeoutMillis: 5000, // 5 seconds connection timeout
      statement_timeout: 10000, // 10 seconds statement timeout
    });

    await this.client.connect();

    // Create the drizzle database instance with the client
    this.database = drizzle(this.client, {
      schema: databaseSchema,
      casing: 'snake_case',
    });

    await migrate(this.database, { migrationsFolder: './drizzle' });
  }
  async teardown() {
    try {
      // Close the PostgreSQL client connection properly
      if (this.client) {
        await this.client
          .end()
          .catch((err) =>
            console.warn(
              'Warning: Error closing database client:',
              err.message,
            ),
          );
      }
    } finally {
      // Always try to stop the container, even if client.end() fails
      if (this.container) {
        try {
          await this.container.stop();
        } catch (err) {
          console.warn(
            'Warning: Error stopping container:',
            (err as Error).message,
          );
          // Continue execution despite errors stopping the container
        }
      }
    }
  }
}

CREATE TABLE IF NOT EXISTS "destination" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL,
	"description" text,
	"activities" text,
	"photos" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packing_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"trip_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_to_destination" (
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"trip_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"start_date" date,
	"end_date" date,
	CONSTRAINT "trip_to_destination_trip_id_destination_id_pk" PRIMARY KEY("trip_id","destination_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"image" text,
	"participants" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packing_item" ADD CONSTRAINT "packing_item_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_to_destination" ADD CONSTRAINT "trip_to_destination_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_to_destination" ADD CONSTRAINT "trip_to_destination_destination_id_destination_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destination"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

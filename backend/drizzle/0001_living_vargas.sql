CREATE TABLE IF NOT EXISTS "diary_entries_to_tags" (
	"diary_entry_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "diary_entries_to_tags_diary_entry_id_tag_id_pk" PRIMARY KEY("diary_entry_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(256) NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "tags_userId_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diary_entries_to_tags" ADD CONSTRAINT "diary_entries_to_tags_diary_entry_id_diary_entries_id_fk" FOREIGN KEY ("diary_entry_id") REFERENCES "public"."diary_entries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diary_entries_to_tags" ADD CONSTRAINT "diary_entries_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

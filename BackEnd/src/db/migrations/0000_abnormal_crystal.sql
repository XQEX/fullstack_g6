DO $$ BEGIN
 CREATE TYPE "public"."live_insert_type" AS ENUM('AUTO', 'MANUAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."live_type" AS ENUM('LIVE', 'END');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."roles" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tiers" AS ENUM('1', '2', '3', '4');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pixelian_membership_proof" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pixelian_id" uuid,
	"oauth_pixelian_id" uuid,
	"membership_proof_image" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pixelian_proof_constraint" UNIQUE("pixelian_id","membership_proof_image"),
	CONSTRAINT "oauthPixelian_proof_constraint" UNIQUE("oauth_pixelian_id","membership_proof_image")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liveStreamCategory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "liveStreamCategory_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liveStream" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vtuber_id" uuid,
	"name" varchar(255) NOT NULL,
	"stream_category_id" uuid,
	"link" varchar(255) NOT NULL,
	"thumbnail_link" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"status" "live_type" DEFAULT 'END' NOT NULL,
	"insert_type" "live_insert_type" DEFAULT 'MANUAL' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "liveStream_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "membership_tier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vtuber_name" varchar(255),
	"tier" "tiers" NOT NULL,
	"tier_name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthPixelian_membership" (
	"oauth_pixelian_id" uuid,
	"membership_tier_id" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniqueoauthPixelianMembershipConstraintConstraint" UNIQUE("oauth_pixelian_id","membership_tier_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthPixelian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"profile_picture" varchar(255),
	"favorite_vtuber_name" varchar(255),
	"role" "roles" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauthPixelian_provider_id_unique" UNIQUE("provider_id"),
	CONSTRAINT "provider_emailUnique" UNIQUE("provider","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pixelian_feelings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feeling" varchar(1000) NOT NULL,
	"vtuber_name" varchar(255) NOT NULL,
	"pixelian_id" uuid,
	"oauth_pixelian_id" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pixelian_membership" (
	"pixelian_id" uuid,
	"membership_tier_id" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pixelianMembershipConstraint" UNIQUE("pixelian_id","membership_tier_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pixelianSessions" (
	"sid" varchar(255) PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pixelian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255),
	"password" varchar(255) NOT NULL,
	"favorite_vtuber_name" varchar(255),
	"role" "roles" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pixelian_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vtuber" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"height" varchar(20) NOT NULL,
	"birthdate" varchar(20) NOT NULL,
	"age" varchar(255) NOT NULL,
	"icon_image" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"port_image" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"youtube_channel_id" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"youtube" varchar(255) NOT NULL,
	"twitter" varchar(255) NOT NULL,
	"discord" varchar(255) NOT NULL,
	"facebook" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vtuber_name_unique" UNIQUE("name"),
	CONSTRAINT "vtuber_youtube_unique" UNIQUE("youtube"),
	CONSTRAINT "vtuber_twitter_unique" UNIQUE("twitter"),
	CONSTRAINT "vtuber_discord_unique" UNIQUE("discord"),
	CONSTRAINT "vtuber_facebook_unique" UNIQUE("facebook")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_membership_proof" ADD CONSTRAINT "pixelian_membership_proof_pixelian_id_pixelian_id_fk" FOREIGN KEY ("pixelian_id") REFERENCES "public"."pixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_membership_proof" ADD CONSTRAINT "pixelian_membership_proof_oauth_pixelian_id_oauthPixelian_id_fk" FOREIGN KEY ("oauth_pixelian_id") REFERENCES "public"."oauthPixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liveStream" ADD CONSTRAINT "liveStream_vtuber_id_vtuber_id_fk" FOREIGN KEY ("vtuber_id") REFERENCES "public"."vtuber"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "liveStream" ADD CONSTRAINT "liveStream_stream_category_id_liveStreamCategory_id_fk" FOREIGN KEY ("stream_category_id") REFERENCES "public"."liveStreamCategory"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membership_tier" ADD CONSTRAINT "membership_tier_vtuber_name_vtuber_name_fk" FOREIGN KEY ("vtuber_name") REFERENCES "public"."vtuber"("name") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthPixelian_membership" ADD CONSTRAINT "oauthPixelian_membership_oauth_pixelian_id_oauthPixelian_id_fk" FOREIGN KEY ("oauth_pixelian_id") REFERENCES "public"."oauthPixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthPixelian_membership" ADD CONSTRAINT "oauthPixelian_membership_membership_tier_id_membership_tier_id_fk" FOREIGN KEY ("membership_tier_id") REFERENCES "public"."membership_tier"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthPixelian" ADD CONSTRAINT "oauthPixelian_favorite_vtuber_name_vtuber_name_fk" FOREIGN KEY ("favorite_vtuber_name") REFERENCES "public"."vtuber"("name") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_feelings" ADD CONSTRAINT "pixelian_feelings_vtuber_name_vtuber_name_fk" FOREIGN KEY ("vtuber_name") REFERENCES "public"."vtuber"("name") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_feelings" ADD CONSTRAINT "pixelian_feelings_pixelian_id_pixelian_id_fk" FOREIGN KEY ("pixelian_id") REFERENCES "public"."pixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_feelings" ADD CONSTRAINT "pixelian_feelings_oauth_pixelian_id_oauthPixelian_id_fk" FOREIGN KEY ("oauth_pixelian_id") REFERENCES "public"."oauthPixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_membership" ADD CONSTRAINT "pixelian_membership_pixelian_id_pixelian_id_fk" FOREIGN KEY ("pixelian_id") REFERENCES "public"."pixelian"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian_membership" ADD CONSTRAINT "pixelian_membership_membership_tier_id_membership_tier_id_fk" FOREIGN KEY ("membership_tier_id") REFERENCES "public"."membership_tier"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pixelian" ADD CONSTRAINT "pixelian_favorite_vtuber_name_vtuber_name_fk" FOREIGN KEY ("favorite_vtuber_name") REFERENCES "public"."vtuber"("name") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vtuber_tierIndex" ON "membership_tier" USING btree ("vtuber_name","tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nameIndex" ON "vtuber" USING btree ("name");
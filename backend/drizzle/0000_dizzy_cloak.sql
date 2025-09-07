CREATE TYPE "public"."difficulty" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "catagories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"catagory" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"problem_id" bigint NOT NULL,
	"hint" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"problem" varchar(255) NOT NULL,
	"description" text,
	"like" bigint DEFAULT 0 NOT NULL,
	"dislike" bigint DEFAULT 0 NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	CONSTRAINT "problems_problem_unique" UNIQUE("problem")
);
--> statement-breakpoint
CREATE TABLE "problemsToCategories" (
	"problem_id" bigint NOT NULL,
	"catagory_id" bigint NOT NULL,
	CONSTRAINT "problemsToCategories_problem_id_catagory_id_pk" PRIMARY KEY("problem_id","catagory_id")
);
--> statement-breakpoint
CREATE TABLE "solvedRecords" (
	"user_id" bigint NOT NULL,
	"problem_id" bigint NOT NULL,
	CONSTRAINT "solvedRecords_user_id_problem_id_pk" PRIMARY KEY("user_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"gmail" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"profile_path" varchar(255) DEFAULT '/PFP/default.png' NOT NULL,
	"gender" "gender" NOT NULL,
	CONSTRAINT "users_gmail_unique" UNIQUE("gmail")
);
--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_catagory_id_catagories_id_fk" FOREIGN KEY ("catagory_id") REFERENCES "public"."catagories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE set null ON UPDATE no action;
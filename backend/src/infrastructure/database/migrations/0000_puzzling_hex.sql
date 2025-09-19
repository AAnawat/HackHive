CREATE TYPE "public"."difficulty" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	CONSTRAINT "categories_category_unique" UNIQUE("category")
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
	"difficulty" "difficulty" NOT NULL,
	"score" integer DEFAULT 500 NOT NULL,
	CONSTRAINT "problems_problem_unique" UNIQUE("problem")
);
--> statement-breakpoint
CREATE TABLE "problemsToCategories" (
	"problem_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "problemsToCategories_problem_id_category_id_pk" PRIMARY KEY("problem_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "solvedRecords" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"problem_id" bigint NOT NULL,
	"solve_score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"gmail" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"pfp_path" varchar(255) DEFAULT '/PFP/default.png' NOT NULL,
	CONSTRAINT "users_gmail_unique" UNIQUE("gmail")
);
--> statement-breakpoint
CREATE TABLE "usersLikeProblems" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"solve_id" bigint NOT NULL,
	"is_like" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usersLikeProblems" ADD CONSTRAINT "usersLikeProblems_solve_id_solvedRecords_id_fk" FOREIGN KEY ("solve_id") REFERENCES "public"."solvedRecords"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "solved_user_problem_idx" ON "solvedRecords" USING btree ("user_id","problem_id");--> statement-breakpoint
CREATE VIEW "public"."problemsWithLikes" AS (select "problems"."id", "problems"."problem", "problems"."description", "problems"."difficulty", "problems"."score", COUNT("usersLikeProblems"."is_like" = true OR NULL)::float / NULLIF(COUNT("usersLikeProblems"."id"), 0) * 100 as "likes" from "problems" left join "solvedRecords" on "problems"."id" = "solvedRecords"."problem_id" left join "usersLikeProblems" on "solvedRecords"."id" = "usersLikeProblems"."solve_id" group by "problems"."id");
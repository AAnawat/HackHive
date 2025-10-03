CREATE TYPE "public"."status" AS ENUM('Running', 'Pending', 'Terminated', 'Error');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"problem_id" bigint NOT NULL,
	"flag" varchar(255) NOT NULL,
	"status" "status" DEFAULT 'Pending' NOT NULL,
	"task_arn" varchar(255),
	"ip_address" varchar(255),
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
DROP VIEW "public"."problemsWithLikes";--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "task_definition" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "duration_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_task_definition_unique" UNIQUE("task_definition");--> statement-breakpoint
CREATE VIEW "public"."problemsWithLikes" AS (select "problems"."id", "problems"."problem", "problems"."description", "problems"."difficulty", "problems"."score", "problems"."task_definition", COUNT("usersLikeProblems"."is_like" = true OR NULL)::float / NULLIF(COUNT("usersLikeProblems"."id"), 0) * 100 as "likes" from "problems" left join "solvedRecords" on "problems"."id" = "solvedRecords"."problem_id" left join "usersLikeProblems" on "solvedRecords"."id" = "usersLikeProblems"."solve_id" group by "problems"."id");
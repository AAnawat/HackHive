CREATE TABLE "flags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"problem_id" bigint NOT NULL,
	"flag_value" varchar(255) NOT NULL,
	"is_case_sensitive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
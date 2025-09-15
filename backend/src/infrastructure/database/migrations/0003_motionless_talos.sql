ALTER TABLE "solvedRecords" DROP CONSTRAINT "solvedRecords_problem_id_problems_id_fk";
--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
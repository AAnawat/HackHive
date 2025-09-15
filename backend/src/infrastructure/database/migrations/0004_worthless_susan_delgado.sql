ALTER TABLE "problemsToCategories" DROP CONSTRAINT "problemsToCategories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "solvedRecords" DROP CONSTRAINT "solvedRecords_problem_id_problems_id_fk";
--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solvedRecords" ADD CONSTRAINT "solvedRecords_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE set null ON UPDATE no action;
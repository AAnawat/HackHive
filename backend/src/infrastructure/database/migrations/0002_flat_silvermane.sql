ALTER TABLE "catagories" RENAME TO "categories";--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "catagory" TO "category";--> statement-breakpoint
ALTER TABLE "problemsToCategories" RENAME COLUMN "catagory_id" TO "category_id";--> statement-breakpoint
ALTER TABLE "problemsToCategories" DROP CONSTRAINT "problemsToCategories_catagory_id_catagories_id_fk";
--> statement-breakpoint
ALTER TABLE "problemsToCategories" DROP CONSTRAINT "problemsToCategories_problem_id_catagory_id_pk";--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_problem_id_category_id_pk" PRIMARY KEY("problem_id","category_id");--> statement-breakpoint
ALTER TABLE "problemsToCategories" ADD CONSTRAINT "problemsToCategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
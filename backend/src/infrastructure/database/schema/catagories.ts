import { relations } from "drizzle-orm";
import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";
import { problemsToCategoriesTable } from "./problemsToCategories";

export const catagoriesTable = pgTable("catagories", {
    id: bigserial({mode: "number"}).primaryKey(),
    catagory: varchar({length: 255}).notNull()
})

export const catagoriesRelations = relations(catagoriesTable, ({many}) => ({
    problemsToCategoriesTable: many(problemsToCategoriesTable)
}))
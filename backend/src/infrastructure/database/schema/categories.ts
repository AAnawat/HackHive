import { relations } from "drizzle-orm";
import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";
import { problemsToCategoriesTable } from "./problemsToCategories";

export const categoriesTable = pgTable("categories", {
    id: bigserial({mode: "number"}).primaryKey(),
    category: varchar({length: 255}).notNull()
})

export const categoriesRelations = relations(categoriesTable, ({many}) => ({
    problemsToCategoriesTable: many(problemsToCategoriesTable)
}))
import { bigint, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { problemsTable } from "./problems";
import { categoriesTable } from "./categories";
import { relations } from "drizzle-orm";

export const problemsToCategoriesTable = pgTable("problemsToCategories", {
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "cascade"}),
    category_id: bigint({mode: "number"}).notNull().references(() => categoriesTable.id, {onDelete: "set null"})
}, (t) => [
    primaryKey({columns: [t.problem_id, t.category_id]})
])

export const problemsToCategoriesRelations = relations(problemsToCategoriesTable, ({one}) => ({
    problemsTable: one(problemsTable, {
        fields: [problemsToCategoriesTable.problem_id],
        references: [problemsTable.id]
    }),
    categoriesTable: one(categoriesTable, {
        fields: [problemsToCategoriesTable.category_id],
        references: [categoriesTable.id]
    })
}))
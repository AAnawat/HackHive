import { bigint, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { problemsTable } from "./problems";
import { catagoriesTable } from "./catagories";
import { relations } from "drizzle-orm";

export const problemsToCategoriesTable = pgTable("problemsToCategories", {
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "cascade"}),
    catagory_id: bigint({mode: "number"}).notNull().references(() => catagoriesTable.id, {onDelete: "set null"})
}, (t) => [
    primaryKey({columns: [t.problem_id, t.catagory_id]})
])

export const problemsToCategoriesRelations = relations(problemsToCategoriesTable, ({one}) => ({
    problemsTable: one(problemsTable, {
        fields: [problemsToCategoriesTable.problem_id],
        references: [problemsTable.id]
    }),
    catagoriesTable: one(catagoriesTable, {
        fields: [problemsToCategoriesTable.catagory_id],
        references: [catagoriesTable.id]
    })
}))
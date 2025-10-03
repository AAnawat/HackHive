import { bigint, bigserial, boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { problemsTable } from "./problems";

export const flagsTable = pgTable("flags", {
    id: bigserial({mode: "number"}).primaryKey(),
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "cascade"}),
    flag_value: varchar({length: 255}).notNull(),
    is_case_sensitive: boolean().notNull().default(true),
})

export const flagsRelations = relations(flagsTable, ({one}) => ({
    problemsTable: one(problemsTable, {
        fields: [flagsTable.problem_id],
        references: [problemsTable.id]
    })
}))


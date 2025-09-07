import { bigint, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { problemsTable } from "./problems";
import { relations } from "drizzle-orm";

export const solvedRecordsTable = pgTable("solvedRecords", {
    user_id: bigint({mode: "number"}).notNull().references(() => usersTable.id, {onDelete: "cascade"}),
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "set null"})
}, (t) => [
    primaryKey({columns: [t.user_id, t.problem_id]})
])

export const solvedRecordsRelations = relations(solvedRecordsTable, ({one}) => ({
    usersTable: one(usersTable, {
        fields: [solvedRecordsTable.user_id],
        references: [usersTable.id]
    }),
    problemsTable: one(problemsTable, {
        fields: [solvedRecordsTable.problem_id],
        references: [problemsTable.id]
    })
}))
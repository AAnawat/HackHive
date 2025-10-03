import { bigint, bigserial, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { problemsTable } from "./problems";
import { relations } from "drizzle-orm";


export const statusEnum = pgEnum("status", ["Running", "Pending", "Terminated", "Error"])

export const sessionsTable = pgTable('sessions', {
    id: bigserial({mode: "number"}).primaryKey(),
    user_id: bigint({mode: "number"}).notNull().references(() => usersTable.id, {onDelete: "cascade"}), 
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "cascade"}),
    flag: varchar({length: 255}).notNull(),
    status: statusEnum().notNull().default("Pending"),
    task_arn: varchar({length: 255}),
    ip_address: varchar({length: 255}),
    started_at: timestamp({mode: "date", withTimezone: true}),
    ended_at: timestamp({mode: "date", withTimezone: true}),
})

export const sessionsRelations = relations(sessionsTable, ({one}) => ({
    usersTable: one(usersTable, {
        fields: [sessionsTable.user_id],
        references: [usersTable.id]
    }),
    problemsTable: one(problemsTable, {
        fields: [sessionsTable.problem_id],
        references: [problemsTable.id]
    })
}))
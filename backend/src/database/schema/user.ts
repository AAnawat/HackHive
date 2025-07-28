import { bigserial, pgTable, smallint, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: bigserial({mode: 'number'}).primaryKey().notNull(),
    username: varchar({length: 255}).notNull(),
    gmail: varchar({length: 255}).notNull()
})
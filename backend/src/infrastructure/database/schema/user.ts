import { relations } from "drizzle-orm";
import { bigserial, pgTable, pgEnum, varchar } from "drizzle-orm/pg-core";
import { solvedRecordsTable } from "./solvedRecords";

export const usersTable = pgTable("users", {
    id: bigserial({mode: 'number'}).primaryKey(),
    username: varchar({length: 255}).notNull(),
    gmail: varchar({length: 255}).notNull().unique(),
    password: varchar({length: 255}).notNull(),
    pfp_path: varchar({length: 255}).notNull().default('/PFP/default.png'),  // TODO: chage when using S3 bucket
})

export const usersRelations = relations(usersTable, ({many}) => ({
    solvedRecordsTable: many(solvedRecordsTable)
}))
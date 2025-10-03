import { relations } from "drizzle-orm";
import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";
import { solvedRecordsTable } from "./solvedRecords";
import profileManagerConfig from "../../../config/pictureManagerConfig";
import { sessionsTable } from "./sessions";

export const usersTable = pgTable("users", {
    id: bigserial({mode: 'number'}).primaryKey(),
    username: varchar({length: 255}).notNull(),
    gmail: varchar({length: 255}).notNull().unique(),
    password: varchar({length: 255}).notNull(),
    pfp_path: varchar({length: 255}).notNull().default(profileManagerConfig.defaultPath),  // TODO: chage when using S3 bucket
})

export const usersRelations = relations(usersTable, ({many, one}) => ({
    solvedRecordsTable: many(solvedRecordsTable),
    sessionsTable: one(sessionsTable, {
        fields: [usersTable.id],
        references: [sessionsTable.user_id]
    })
}))
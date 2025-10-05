import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type Session from "../../../entities/session";
import type ISessionDAO from "../../../interfaces/DAO/sessionDAO";
import * as schema from '../schema'
import { and, eq } from "drizzle-orm";
import { sessionsTable } from "../schema";
import type { IGetSessionFilter, IUpdateSessionValues } from "../../../interfaces/DAO/sessionDAO";


export default class SessionDAO implements ISessionDAO {
    private connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    public async get(filter: IGetSessionFilter): Promise<Session[]> {
        const conditions = [];
        if (filter.Id) conditions.push(eq(sessionsTable.id, filter.Id));
        if (filter.userId) conditions.push(eq(sessionsTable.user_id, filter.userId));
        if (filter.problemId) conditions.push(eq(sessionsTable.problem_id, filter.problemId));
        if (filter.status) conditions.push(eq(sessionsTable.status, filter.status));

        const sessionResult = await this.connection
            .select()
            .from(schema.sessionsTable)
            .where(and(...conditions));

        return sessionResult;
    }

    public async create(userId: number, problemId: number, flag: string): Promise<Session> {
        const createResult = await this.connection.transaction(async (tx) => {
            const problemDuration = (await tx
                .select({ duration: schema.problemsTable.duration_minutes })
                .from(schema.problemsTable)
                .where(eq(schema.problemsTable.id, problemId))
                .limit(1))[0].duration;

            if (!problemDuration) 
                throw new Error("Problem not found");

            const insertResult = await tx
                .insert(schema.sessionsTable)
                .values({
                    user_id: userId,
                    problem_id: problemId,
                    flag: flag,
                    status: "Pending",
                    started_at: new Date(),
                    ended_at: new Date(new Date().getTime() + problemDuration * 60 * 1000)
                })
                .returning()
            
            return insertResult[0];
        })

        return createResult;
    }

    public async update(sessionId: number, updateValues: IUpdateSessionValues): Promise<boolean> {
        const updateResult = await this.connection
            .update(schema.sessionsTable)
            .set(updateValues)
            .where(eq(sessionsTable.id, sessionId))
            .returning();
        
        if (updateResult.length === 0)
            throw new Error("Session not found");

        return true;
    }

    public async delete(sessionId: number): Promise<boolean> {
        const deleteResult = await this.connection
            .delete(schema.sessionsTable)
            .where(eq(sessionsTable.id, sessionId))
            .returning();
        
        if (deleteResult.length === 0)
            throw new Error("Session not found");

        return true;
    }
}
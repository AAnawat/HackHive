import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from '../schema'
import User from "../../../entities/user";
import type IUserDAO from "../../../interfaces/DAO/userDAO";
import type { LeaderboardEntry } from "../../../interfaces/DAO/userDAO";
import { and, desc, eq, sql } from "drizzle-orm";
import { usersTable, solvedRecordsTable } from "../schema";

export default class UserDAO implements IUserDAO {
    connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    public async find(filter: Partial<Omit<User, 'pfp_path'>>, page: number, perPage: number): Promise<User[]> {

        const condition = []

        if (filter.id) condition.push(eq(usersTable.id, filter.id))
        if (filter.gmail) condition.push(eq(usersTable.gmail, filter.gmail))
        if (filter.username) condition.push(eq(usersTable.username, filter.username))

        const findResult = await this.connection
            .select({
                id: usersTable.id,
                username: usersTable.username,
                gmail: usersTable.gmail,
                pfp_path: usersTable.pfp_path,
                score: sql`COALESCE(SUM(${solvedRecordsTable.solve_score}), 0)`.mapWith(Number).as('score')
            })
            .from(usersTable)
            .leftJoin(solvedRecordsTable, eq(usersTable.id, solvedRecordsTable.user_id))
            .where(and(...condition))
            .groupBy(usersTable.id)
            .limit(perPage)
            .offset((perPage * (page - 1)))

        return findResult

    }


    public async findOne(filter: Partial<Omit<User, 'pfp_path'>>): Promise<User> {

        const condition = []

        if (filter.id) condition.push(eq(usersTable.id, filter.id))
        if (filter.gmail) condition.push(eq(usersTable.gmail, filter.gmail))
        if (filter.username) condition.push(eq(usersTable.username, filter.username))

        const findResult = await this.connection
            .select({
                id: usersTable.id,
                username: usersTable.username,
                gmail: usersTable.gmail,
                pfp_path: usersTable.pfp_path,
                score: sql`COALESCE(SUM(${solvedRecordsTable.solve_score}), 0)`.mapWith(Number).as('score')
            })
            .from(usersTable)
            .leftJoin(solvedRecordsTable, eq(usersTable.id, solvedRecordsTable.user_id))
            .where(and(...condition))
            .groupBy(usersTable.id)
            .limit(1)

        return findResult[0]

    }


    public async create(payload: Partial<User>, password: string): Promise<User> {

        const insertingValue: any = {
            username: payload.username,
            gmail: payload.gmail,
            password: password
        }

        const createResult = await this.connection
            .insert(usersTable)
            .values(insertingValue)
            .returning()
        
        return createResult[0]

    }


    public async update(id: number, payload: Partial<User>, password?: string): Promise<boolean> {

        const changingValue: any = {
            ...payload,
        }
        if (password) changingValue.password = password

        const updateResult = await this.connection
            .update(usersTable)
            .set(changingValue)
            .where(eq(usersTable.id, id))
        
        return true

    }


    public async delete(id: number): Promise<boolean> {

        const deleteResult = await this.connection
            .delete(usersTable)
            .where(eq(usersTable.id, id))
        
        return true
       
    }

    public async findForAuth(filter: Partial<Omit<User, 'pfp_path'>>): Promise<User & { password: string }> {
        const condition = []

        if (filter.id) condition.push(eq(usersTable.id, filter.id))
        if (filter.gmail) condition.push(eq(usersTable.gmail, filter.gmail))
        if (filter.username) condition.push(eq(usersTable.username, filter.username))

        const findResult = await this.connection
            .select()
            .from(usersTable)
            .where(and(...condition))
            .limit(1)

        return findResult[0]
    }

    public async getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
        const leaderboard = await this.connection
            .select({
                id: usersTable.id,
                username: usersTable.username,
                totalScore: sql<number>`COALESCE(SUM(${solvedRecordsTable.solve_score}), 0)`.as('totalScore'),
                problemsSolved: sql<number>`COUNT(${solvedRecordsTable.id})`.as('problemsSolved')
            })
            .from(usersTable)
            .leftJoin(solvedRecordsTable, eq(usersTable.id, solvedRecordsTable.user_id))
            .groupBy(usersTable.id)
            .orderBy(desc(sql`totalScore`))
            .limit(limit);

        return leaderboard;
    }

    public async findDoneProblems(userId: number): Promise<number[]> {
        const findResult = await this.connection
            .select({
                problem_id: solvedRecordsTable.problem_id
            })
            .from(solvedRecordsTable)
            .where(eq(solvedRecordsTable.user_id, userId))
        return findResult.map(record => record.problem_id);
    }
}
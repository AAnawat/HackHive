import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from '../schema'
import User from "../../../entities/user";
import type IUserDAO from "../../../interfaces/DAO/userDAO";
import { and, eq, type Equal } from "drizzle-orm";
import { usersTable } from "../schema";

export default class UserDAO implements IUserDAO {
    connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    public async find(filter: Partial<User>, page: number, perPage: number): Promise<User[]> {

        const condition = []

        if (filter.id) condition.push(eq(usersTable.id, filter.id))
        if (filter.gmail) condition.push(eq(usersTable.gmail, filter.gmail))
        if (filter.username) condition.push(eq(usersTable.username, filter.username))

        const findResult = await this.connection
            .select({
                id: usersTable.id,
                username: usersTable.username,
                gmail: usersTable.gmail,
                pfp_path: usersTable.pfp_path
            })
            .from(usersTable)
            .where(and(...condition))
            .limit(perPage)
            .offset((perPage * (page - 1)))

        return findResult

    }


    public async findOne(filter: Partial<User>): Promise<User> {

        const condition = []

        if (filter.id) condition.push(eq(usersTable.id, filter.id))
        if (filter.gmail) condition.push(eq(usersTable.gmail, filter.gmail))
        if (filter.username) condition.push(eq(usersTable.username, filter.username))

        const findResult = await this.connection
            .select({
                id: usersTable.id,
                username: usersTable.username,
                gmail: usersTable.gmail,
                pfp_path: usersTable.pfp_path
            })
            .from(usersTable)
            .where(and(...condition))
            .limit(1)

        return findResult[0]

    }


    public async create(payload: Partial<User>, password: string): Promise<User> {

        const insertingValue: any = {
            username: payload.username,
            gmail: payload.gmail,
            password: password
        }
        if (payload.pfp_path) insertingValue.pfp_path = payload.pfp_path

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

}
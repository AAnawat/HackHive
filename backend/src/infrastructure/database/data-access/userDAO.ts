import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema/index"
import User from "../../../entities/user";
import type IUserDAO from "../../../interfaces/DAO/userDAO";

export default class UserDAO implements IUserDAO {
    connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    find(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    
    findOne(): Promise<User> {
        throw new Error("Method not implemented.");
    }

    create(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    update(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    delete(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
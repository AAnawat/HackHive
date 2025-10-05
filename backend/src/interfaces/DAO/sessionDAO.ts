import type Session from "../../entities/session";

export default interface ISessionDAO {
    get(filter: IGetSessionFilter): Promise<Session[]>;
    create(userId: number, problemId: number, flag: string): Promise<Session>;
    update(sessionId: number, updateValues: IUpdateSessionValues): Promise<boolean>;
    delete(sessionId: number): Promise<boolean>;
}

export interface IUpdateSessionValues {
    flag?: string;
    status?: "Running" | "Pending" | "Terminated" | "Error";
    task_arn?: string;
    ip_address?: string;
    ended_at?: Date;
}

export interface IGetSessionFilter {
    Id?: number;
    userId?: number;
    problemId?: number;
    status?: "Running" | "Pending" | "Terminated" | "Error";
}
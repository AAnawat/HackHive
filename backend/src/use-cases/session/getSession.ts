import type Session from "../../entities/session";
import type SessionDAO from "../../infrastructure/database/data-access/sessionDAO";
import type { IGetSessionFilter } from "../../interfaces/DAO/sessionDAO";

export default class GetSession {
    private sessionDAO: SessionDAO

    constructor(sessionDAO: SessionDAO) {
        this.sessionDAO = sessionDAO;
    }

    public async call(filter: IGetSessionFilter): Promise<Session> {
        const sessions = await this.sessionDAO.get(filter);
        if (sessions.length === 0) 
            throw new Error("Session not found");

        const result = sessions[0];
        return result;
    }
}
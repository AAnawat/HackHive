import type Session from "../../entities/session";
import type SessionDAO from "../../infrastructure/database/data-access/sessionDAO";
import type { IGetSessionFilter } from "../../interfaces/DAO/sessionDAO";

export default class GetSession {
    private sessionDAO: SessionDAO

    constructor(sessionDAO: SessionDAO) {
        this.sessionDAO = sessionDAO;
    }

    public async call(userID?: number, sessionID?: number): Promise<Session> {
        if (!userID && !sessionID)
            throw new Error("User ID or Session ID must be provided");
        const filter: IGetSessionFilter = {};
        if (sessionID) filter.Id = sessionID;
        else if (userID) filter.userId = userID;

        const sessions = await this.sessionDAO.get(filter);
        if (sessions.length === 0) 
            throw new Error("Session not found");

        if (sessions.length > 1)
            throw new Error("Multiple sessions found");

        if (sessions[0].user_id !== userID && userID !== undefined) 
            throw new Error("User ID does not match");

        const result = sessions[0];
        return result;
    }
}
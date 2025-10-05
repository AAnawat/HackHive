import type IContainerManager from "../../interfaces/containerManager";
import type ISessionDAO from "../../interfaces/DAO/sessionDAO";

export default class StopSession {
    private sessionDAO: ISessionDAO;
    private containerManager: IContainerManager;

    constructor(sessionDAO: ISessionDAO, containerManager: IContainerManager) {
        this.sessionDAO = sessionDAO;
        this.containerManager = containerManager;
    }


    public async call(sessionId: number, reason: string): Promise<boolean> {
        const session = await this.sessionDAO.get({ Id: sessionId });
        if (session.length === 0) 
            throw new Error("Session not found");

        const stopContainer = await this.containerManager.deleteContainer(session[0].task_arn, reason);
        if (!stopContainer) 
            throw new Error("Failed to stop container");

        const deleteResult = await this.sessionDAO.delete(sessionId);
        if (!deleteResult) 
            throw new Error("Failed to delete session");

        return true;
    }
}
import type Session from "../../entities/session";
import type IContainerManager from "../../interfaces/containerManager";
import type ISessionDAO from "../../interfaces/DAO/sessionDAO";
import type { IValidator } from "../../interfaces/validator";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";


export default class StartSession {
    private sessionDAO: ISessionDAO;
    private problemDAO: IProblemDAO;
    private containerManager: IContainerManager;
    private validator: IValidator;

    constructor(sessionDAO: ISessionDAO, problemDAO: IProblemDAO, containerManager: IContainerManager, validator: IValidator) {
        this.sessionDAO = sessionDAO;
        this.problemDAO = problemDAO;
        this.containerManager = containerManager;
        this.validator = validator;
    }


    public async call(input: { userId: number, problemId: number }): Promise<Session> {
        // Check if user already has an opened session
        const openedSessions = await this.sessionDAO.get({ userId: input.userId });
        if (openedSessions.length >= 1) 
            throw new Error("User already has an opened session");

        // Create session, Validate input data
        const flag = this.generateFlags(16);
        const payload = { ...input, flag };

        const validation = this.validator.validate(payload);
        if (validation.error) 
            throw new Error("Invalid input data");

        const createdSession = await this.sessionDAO.create(
            validation.data.userId,
            validation.data.problemId,
            validation.data.flag
        );
        if (!createdSession)
            throw new Error("Failed to create session");



        const problem = await this.problemDAO.findOne(input.problemId);
        if (!problem)
            throw new Error("Problem not found");


        // Launch container
        const launchResponse = this.containerManager.createContainer(
            problem.task_definition,
            { FLAG: createdSession.flag }
        )
        launchResponse.then(async (containerId) => {
            await this.containerManager.waitContainer(containerId);
            const address = await this.containerManager.getContainerAddress(containerId);

            const updateResult = await this.updateSession(createdSession.id, containerId, address);
            if (!updateResult)
                throw new Error("Failed to update session");

        }).catch(err => {
            this.sessionDAO.update(createdSession.id, { status: "Error" });
            console.error("Error: ", err);
        })

        return createdSession;
    }

    private generateFlags(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    private async updateSession(sessionId: number, taskArn: string, ip: string): Promise<boolean> {
        const updateResult = await this.sessionDAO.update(sessionId, {
            task_arn: taskArn,
            ip_address: ip,
            status: "Running"
        })
        return updateResult;
    }
}
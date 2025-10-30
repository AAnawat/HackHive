import type Authorize from "../use-cases/auth/authorize";
import type GetSession from "../use-cases/session/getSession";
import type StartSession from "../use-cases/session/startSession";
import type StopSession from "../use-cases/session/stopSession";
import type SubmitFlag from "../use-cases/session/submitFlag";


export default class SessionController {
    private startSession: StartSession;
    private getSession: GetSession;
    private stopSession: StopSession;
    private submitFlag: SubmitFlag;
    private authorize: Authorize;

    constructor(launchInstance: StartSession, getSession: GetSession, stopSession: StopSession, submitFlag: SubmitFlag, authorize: Authorize) {
        this.startSession = launchInstance;
        this.getSession = getSession;
        this.authorize = authorize;
        this.submitFlag = submitFlag;
        this.stopSession = stopSession;
    }


    public async get(token: string, sessionId?: number): Promise<any> {
        try {

            const authorized = await this.authorize.call(token);
            if (!authorized) 
                throw new Error("Unauthorized");

            const result = await this.getSession.call(authorized.id, sessionId);
            if (result.user_id !== authorized.id)
                throw new Error("Forbidden");

            return result;
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }

    public async launch(token: string, userId: number, problemId: number): Promise<any> {
        try {

            const authorized = await this.authorize.call(token);
            if (!authorized || authorized.id !== userId) 
                throw new Error("Unauthorized");

            const result = await this.startSession.call({ userId, problemId });
            return result;
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }

    public async stop(token: string, sessionId: number): Promise<boolean> {
        try {
            
            const authorized = await this.authorize.call(token);
            if (!authorized) 
                throw new Error("Unauthorized");

            const session = await this.getSession.call(authorized.id, sessionId);
            if (session.user_id !== authorized.id)
                throw new Error("Forbidden");

            const result = await this.stopSession.call(sessionId, "User requested stop");
            return result;

        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = error.message || "";
                if (errorMessage.includes("Task can not be blank")) throw new Error("Please wait until container is ready");
                throw new Error(error.message)
            }
        }
    }

    public async submit(token: string, sessionId: number, flag: string): Promise<{ correct: boolean; message: string; score?: number }> {
        try {

            const authorized = await this.authorize.call(token);
            if (!authorized) throw new Error("Unauthorized");

            const session = await this.getSession.call(authorized.id, sessionId);
            if (session.user_id !== authorized.id)
                throw new Error("Forbidden");

            const result = await this.submitFlag.call(sessionId, flag);
            return result;
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }
}
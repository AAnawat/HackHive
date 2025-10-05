import type ISolveDAO from "../../interfaces/DAO/solveDAO";
import type ISessionDAO from "../../interfaces/DAO/sessionDAO";
import type IContainerManager from "../../interfaces/containerManager";

export default class SubmitFlag {
    private sessionDAO: ISessionDAO;
    private solveDAO: ISolveDAO;
    private containerManager: IContainerManager;

    constructor(sessionDAO: ISessionDAO, solveDAO: ISolveDAO, containerManager: IContainerManager) {
        this.sessionDAO = sessionDAO;
        this.solveDAO = solveDAO;
        this.containerManager = containerManager;
    }

    async call(sessionId: number, submittedFlag: string): Promise<{ correct: boolean; message: string; score?: number }> {
        // Get the correct flag
        const session = await this.sessionDAO.get({ Id: sessionId, status: "Running" });
        if (session.length === 0) throw new Error("No active session found for this problem");
        if (session.length > 1) throw new Error("Multiple active sessions found for this problem");
        if (!session[0].flag) throw new Error("Session flag not found");

        // Check if already solved
        const existingSolve = await this.solveDAO.checkSolveExists(session[0].user_id, session[0].problem_id);

        // Compare flags
        const correctFlag = session[0].flag;

        let isCorrect;
        const regex = /^flag\{([A-Za-z0-9]+)\}$/;
        const match = submittedFlag.match(regex);
        if (match) {
            isCorrect = (match[1] === correctFlag);
        } else {
            isCorrect = (submittedFlag === correctFlag);
        }
            

        if (isCorrect) {
            // Record the solve
            if (!existingSolve) 
                var score = await this.solveDAO.solvedProblem(session[0].user_id, session[0].problem_id);
            const stopContainer = await this.containerManager.deleteContainer(session[0].task_arn, "Flag submitted correctly");
            if (!stopContainer) throw new Error("Failed to stop container");

            const deleteResult = await this.sessionDAO.delete(sessionId);
            if (!deleteResult) throw new Error("Failed to delete session");

            if (existingSolve) {
                return {
                    correct: true,
                    message: "Correct! But you have already solved this problem before. No additional points awarded."
                }
            } else {
                return {
                    correct: true,
                    message: "Correct! Flag accepted.",
                    score: score
                };
            }
        } else {
            return {
                correct: false,
                message: "Incorrect flag. Try again!"
            };
        }
    }
}


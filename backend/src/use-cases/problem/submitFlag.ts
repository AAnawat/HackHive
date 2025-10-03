import type IFlagDAO from "../../interfaces/DAO/flagDAO";
import type ISolveDAO from "../../interfaces/DAO/solveDAO";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";

export default class SubmitFlag {
    private flagDAO: IFlagDAO;
    private solveDAO: ISolveDAO;
    private problemDAO: IProblemDAO;

    constructor(flagDAO: IFlagDAO, solveDAO: ISolveDAO, problemDAO: IProblemDAO) {
        this.flagDAO = flagDAO;
        this.solveDAO = solveDAO;
        this.problemDAO = problemDAO;
    }

    async call(userId: number, problemId: number, submittedFlag: string): Promise<{ correct: boolean; message: string; score?: number }> {
        // Check if problem exists
        const problem = await this.problemDAO.findOne(problemId);
        if (!problem) {
            throw new Error("Problem not found");
        }

        // Get the correct flag
        const flagData = await this.flagDAO.getByProblemId(problemId);
        if (!flagData) {
            throw new Error("No flag configured for this problem");
        }

        // Check if already solved
        const existingSolve = await this.solveDAO.findByUserAndProblem(userId, problemId);
        if (existingSolve) {
            return { correct: false, message: "You have already solved this problem" };
        }

        // Compare flags
        const correctFlag = flagData.flag_value;
        const isCorrect = flagData.is_case_sensitive 
            ? submittedFlag === correctFlag
            : submittedFlag.toLowerCase() === correctFlag.toLowerCase();

        if (isCorrect) {
            // Record the solve
            await this.solveDAO.create({
                user_id: userId,
                problem_id: problemId,
                solve_score: problem.score
            });

            return {
                correct: true,
                message: "Correct! Flag accepted.",
                score: problem.score
            };
        } else {
            return {
                correct: false,
                message: "Incorrect flag. Try again!"
            };
        }
    }
}


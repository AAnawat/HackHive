import type ISolveDAO from "../../interfaces/DAO/solveDAO";

export default class VoteProblem {
    private solveDAO: ISolveDAO;

    constructor(solveDAO: ISolveDAO) {
        this.solveDAO = solveDAO;
    }


    public async call(userId: number, problemId: number, isLiked: boolean): Promise<boolean> {
        return await this.solveDAO.voteProblem(userId, problemId, isLiked);
    }
}
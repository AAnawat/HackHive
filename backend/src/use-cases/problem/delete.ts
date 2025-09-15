import type IProblemDAO from "../../interfaces/DAO/problemDAO";

export default class DeleteProblem {
    private problemDAO: IProblemDAO;

    constructor(problemDAO: IProblemDAO) {
        this.problemDAO = problemDAO
    }

    public async call(id: number): Promise<boolean> {
        return await this.problemDAO.delete(id);
    }
}
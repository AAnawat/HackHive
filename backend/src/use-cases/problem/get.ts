import type IProblemDAO from "../../interfaces/DAO/problemDAO";

export default class GetProblem {
    private problemDAO: IProblemDAO;

    constructor(problemDAO: IProblemDAO) {
        this.problemDAO = problemDAO;
    }


    public async call(filter: number) {
        return await this.problemDAO.findOne(filter);
    }
}
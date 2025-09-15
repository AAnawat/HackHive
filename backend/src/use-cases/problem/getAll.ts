import type { IFindAllFilter } from "../../interfaces/DAO/problemDAO";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";

export default class GetAllProblems {
    private problemDAO: IProblemDAO;

    constructor(problemDAO: IProblemDAO) {
        this.problemDAO = problemDAO;
    }


    public async call(filter: IFindAllFilter, page: number, perPage: number) {
        return await this.problemDAO.findAll(filter, page, perPage);
    }
}
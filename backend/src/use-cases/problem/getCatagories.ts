import type IProblemDAO from "../../interfaces/DAO/problemDAO";

export default class GetCategories {
    private problemDAO: IProblemDAO;

    constructor(problemDAO: IProblemDAO) {
        this.problemDAO = problemDAO;
    }


    public async call() {
        const categories = await this.problemDAO.getCatagories();
        return categories;
    }
}
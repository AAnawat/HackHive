import type { IFindAllFilter } from "../interfaces/DAO/problemDAO";
import type GetAllProblems from "../use-cases/problem/getAll";

export default class ProblemController {
    private getAllProblems: GetAllProblems;

    constructor(getAllProblems: GetAllProblems) {
        this.getAllProblems = getAllProblems;
    }


    public async getAll(filter: IFindAllFilter, page: number, perPage: number) {
        try {

            const problems = await this.getAllProblems.call(filter, page, perPage);
            return problems;
            
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = error.message.toString();
                if (errorMessage.includes("Failed query")) throw new Error("Invalid filter");
                else throw new Error(error.message);
            }
            throw new Error("Fetching problems failed");
        }
    }
}
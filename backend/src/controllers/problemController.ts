import type Problem from "../entities/problem";
import type { IFindAllFilter } from "../interfaces/DAO/problemDAO";
import type AuthorizeAdmin from "../use-cases/auth/authorizeAdmin";
import type CreateProblem from "../use-cases/problem/create";
import type DeleteProblem from "../use-cases/problem/delete";
import type GetProblem from "../use-cases/problem/get";
import type GetAllProblems from "../use-cases/problem/getAll";
import type updateProblem from "../use-cases/problem/update";

export default class ProblemController {
    private getAllProblems: GetAllProblems;
    private getProblem: GetProblem;
    private createProblem: CreateProblem;
    private updateProblem: updateProblem;
    private deleteProblem: DeleteProblem;
    private authorizeAdmin: AuthorizeAdmin;

    constructor(
        getAllProblems: GetAllProblems,
        getProblem: GetProblem,
        createProblem: CreateProblem,
        updateProblem: updateProblem,
        deleteProblem: DeleteProblem,
        authorizeAdmin: AuthorizeAdmin
    ) {
        this.getAllProblems = getAllProblems;
        this.getProblem = getProblem;
        this.createProblem = createProblem;
        this.updateProblem = updateProblem;
        this.deleteProblem = deleteProblem;
        this.authorizeAdmin = authorizeAdmin;
    }


    public async getAll(filter: IFindAllFilter, page: number, perPage: number) {
        try {

            const problems = await this.getAllProblems.call(filter, page, perPage);
            return problems;

        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                const errorMessage = error.message.toString();
                if (errorMessage.includes("Failed query")) throw new Error("Invalid filter");
                else throw new Error(error.message);
            }
            throw new Error("Fetching problems failed");
        }
    }

    public async get(filter: number) {
        try {

            return await this.getProblem.call(filter);

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }

    public async create(adminToken: string, payload: Problem): Promise<boolean> {
        try {

            const isAdmin = this.authorizeAdmin.call(adminToken);
            if (!isAdmin) throw new Error("Unauthorized");

            return await this.createProblem.call(payload);

        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = error.cause.toString();
                if (errorMessage.includes("duplicate key value")) throw new Error("Problem already exists");
                throw new Error(error.message);
            }
        }
    }

    public async update(adminToken: string, id: number, payload: Partial<Problem>): Promise<boolean> {
        try {

            const isAdmin = this.authorizeAdmin.call(adminToken);
            if (!isAdmin) throw new Error("Unauthorized");

            return await this.updateProblem.call(id, payload);
            
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = error.cause.toString();
                if (errorMessage.includes("duplicate key value")) throw new Error("Can't change name to an existing problem");
                throw new Error(error.message);
            }
        }
    }

    public async delete(adminToken: string, id: number): Promise<boolean> {
        try {

            const isAdmin = this.authorizeAdmin.call(adminToken);
            if (!isAdmin) throw new Error("Unauthorized");

            return await this.deleteProblem.call(id);
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }
}
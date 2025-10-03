import type { IFindAllFilter } from "../../interfaces/DAO/problemDAO";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";
import type IUserDAO from "../../interfaces/DAO/userDAO";

export default class GetAllProblems {
    private problemDAO: IProblemDAO;
    private userDAO: IUserDAO

    constructor(problemDAO: IProblemDAO, userDAO: IUserDAO) {
        this.problemDAO = problemDAO;
        this.userDAO = userDAO;
    }


    public async call(filter: IFindAllFilter, page: number, perPage: number) {
        let problems = await this.problemDAO.findAll(filter, page, perPage);
        
        if (filter.user) {
            const DoneProblems = await this.userDAO.findDoneProblems(filter.user);

            problems = problems.map(problem => {
                return {
                    ...problem,
                    done: problem.id in DoneProblems
                }
            })
        }

        return problems;
    }
}
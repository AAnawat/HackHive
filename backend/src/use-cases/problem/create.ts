import type Problem from "../../entities/problem";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";
import type { IValidator } from "../../interfaces/validator";

export default class CreateProblem {
    private problemDAO: IProblemDAO;
    private validator: IValidator;

    constructor(problemDAO: IProblemDAO, validator: IValidator) {
        this.problemDAO = problemDAO;
        this.validator = validator;
    }


    public async call(payload: any): Promise<boolean> {
        const validationResult = this.validator.validate(payload);
        if (validationResult.error) {
            throw new Error("Validation failed");
        }
        const problemData = validationResult.data as Problem;
        const problemId = await this.problemDAO.create(problemData);
        return problemId;
    }
}
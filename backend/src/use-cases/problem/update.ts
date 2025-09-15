import type IProblemDAO from "../../interfaces/DAO/problemDAO";
import type { IValidator } from "../../interfaces/validator";
import Problem from "../../entities/problem";


export default class updateProblem {
    private problemDAO: IProblemDAO;
    private validator: IValidator;

    constructor(problemDAO: IProblemDAO, validator: IValidator) {
        this.problemDAO = problemDAO;
        this.validator = validator;
    }


    public async call(id: number, payload: any): Promise<boolean> {
        const validationResult = this.validator.validate(payload);
        if (validationResult.error) {
            throw new Error("Validation failed");
        }

        const updateData = validationResult.data as Partial<Problem>;
        const updateResult = await this.problemDAO.update(id, updateData);
        return updateResult;
    }
}
import type Problem from "../../entities/problem";

export default interface IProblemDAO {
    findAll(filter: IFindAllFilter, page: number, perPage: number): Promise<Problem[]>;
    findOne(filter: IFindOneFilter): Promise<Problem>;
    create(payload: Problem): Promise<Problem>;
    update(id: number, payload: Partial<Problem>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}

export interface IFindAllFilter {
    problem?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    categories?: string[];
}

export interface IFindOneFilter {
    id: number;
    problem?: string;
}
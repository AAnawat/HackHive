import type IProblemDAO from "../../../interfaces/DAO/problemDAO";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from '../schema'
import Problem from "../../../entities/problem";
import type { IFindAllFilter, IFindOneFilter } from "../../../interfaces/DAO/problemDAO";
import { and, count, eq, inArray, like, sql } from "drizzle-orm";
import { 
    problemsToCategoriesTable,
    problemsTable,
    categoriesTable ,
    hintsTable
} from "../schema";


export default class ProblemDAO implements IProblemDAO {
    private connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    public async findAll(filter: IFindAllFilter, page: number, perPage: number): Promise<Problem[]> {
        const conditions: any = [];
        if (filter.problem) conditions.push(like(problemsTable.problem, `${filter.problem}%`));
        if (filter.difficulty) conditions.push(eq(problemsTable.difficulty, filter.difficulty));
        if (filter.categories && filter.categories.length > 0) {
            const subquery = this.connection
                .select({ id: problemsTable.id })
                .from(problemsTable)
                .innerJoin(problemsToCategoriesTable, eq(problemsToCategoriesTable.problem_id, problemsTable.id))
                .innerJoin(categoriesTable, eq(categoriesTable.id, problemsToCategoriesTable.category_id))
                .where(inArray(categoriesTable.category, filter.categories))
                .groupBy(problemsTable.id)
                .having(sql`COUNT(DISTINCT ${categoriesTable.category}) >= ${filter.categories.length}`);
            
            conditions.push(inArray(problemsTable.id, subquery));
        }
        
        const findResult = await this.connection.query.problemsTable.findMany({
            with: {
                problemsToCategoriesTable: {
                    with: {
                        categoriesTable: true
                    }
                },
                hintsTable: true
            },
            where: and(...conditions),
            limit: perPage,
            offset: (page - 1) * perPage,
            orderBy: problemsTable.id
        });

        const output = []
        for (let problem of findResult) {
            output.push({
                id: problem.id,
                problem: problem.problem,
                description: problem.description,
                like: problem.like,
                dislike: problem.dislike,
                difficulty: problem.difficulty,

                hints: problem.hintsTable ? problem.hintsTable.map(hintObj => hintObj.hint) : [],
                categories: problem.problemsToCategoriesTable
                    ? problem.problemsToCategoriesTable.map(ptc => ptc.categoriesTable.category)
                    : []
            })
        }

        return output
    }

    findOne(filter: IFindOneFilter): Promise<Problem> {
        throw new Error("Method not implemented.");
    }

    create(payload: Problem): Promise<Problem> {
        throw new Error("Method not implemented.");
    }

    update(id: number, payload: Partial<Problem>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
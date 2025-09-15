import type IProblemDAO from "../../../interfaces/DAO/problemDAO";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from '../schema'
import Problem from "../../../entities/problem";
import type { IFindAllFilter } from "../../../interfaces/DAO/problemDAO";
import { and, eq, inArray, like, sql } from "drizzle-orm";
import {
    problemsToCategoriesTable,
    problemsTable,
    categoriesTable,
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
            output.push(this.mapToProblemEntity(problem))
        }

        return output
    }

    public async findOne(filter: number): Promise<Problem> {

        const findResult = await this.connection.query.problemsTable.findFirst({
            with: {
                problemsToCategoriesTable: {
                    with: {
                        categoriesTable: true
                    }
                },
                hintsTable: true
            },
            where: eq(problemsTable.id, filter)
        })

        if (!findResult) throw new Error("Problem not found");

        return this.mapToProblemEntity(findResult);

    }

    public async create(payload: Problem): Promise<boolean> {

        const createResult = await this.connection.transaction(async (tx) => {
            const insertedProblem = (await tx.insert(problemsTable).values({
                problem: payload.problem,
                description: payload.description,
                like: payload.like,
                dislike: payload.dislike,
                difficulty: payload.difficulty
            }).returning())[0];

            if (payload.hints && payload.hints.length > 0) {
                await tx.insert(hintsTable).values(payload.hints.map((hint) => ({ problem_id: insertedProblem.id, hint })));
            }

            if (payload.categories && payload.categories.length > 0) {
                await tx.insert(categoriesTable).values(payload.categories.map((category) => ({ category }))).onConflictDoNothing();
                const categoriesID = await tx.select({ id: categoriesTable.id }).from(categoriesTable).where(inArray(categoriesTable.category, payload.categories));
                await tx.insert(problemsToCategoriesTable).values(categoriesID.map((cat) => ({
                    problem_id: insertedProblem.id,
                    category_id: cat.id
                })));
            }

            return true;

        })

        return createResult;

    }

    public async update(id: number, payload: Partial<Problem>): Promise<boolean> {

        const updateResult = await this.connection.transaction(async (tx) => {
            if (payload.hints) {
                const currentHintsObj = await tx.select().from(hintsTable).where(eq(hintsTable.problem_id, id));
                const currentHints = currentHintsObj.map((hint) => hint.hint);

                const deleteHints = currentHints.filter((hint) => !payload.hints?.includes(hint));
                const addHints = payload.hints.filter((hint) => !currentHints.includes(hint));

                if (deleteHints && deleteHints.length > 0) await tx.delete(hintsTable).where(and(eq(hintsTable.problem_id, id), inArray(hintsTable.hint, deleteHints)));
                if (addHints && addHints.length > 0) await tx.insert(hintsTable).values(addHints.map((hint) => ({ problem_id: id, hint })));
            }

            if (payload.categories) {
                const currentCategoriesObj = await tx.query.problemsToCategoriesTable.findMany({
                    with: {
                        categoriesTable: true
                    },
                    where: eq(problemsToCategoriesTable.problem_id, id)
                })

                const currentCategories = currentCategoriesObj.map((obj) => obj.categoriesTable.category);

                const deleteCategories = currentCategories.filter((cat) => !payload.categories?.includes(cat));
                const addCategories = payload.categories.filter((cat) => !currentCategories.includes(cat));

                if (deleteCategories.length > 0) {
                    const subquery = tx.select({ id: categoriesTable.id })
                        .from(problemsToCategoriesTable)
                        .leftJoin(categoriesTable, eq(categoriesTable.id, problemsToCategoriesTable.category_id))
                        .where(inArray(categoriesTable.category, deleteCategories))
                        .groupBy(categoriesTable.id)
                        .having(sql`(COUNT(${categoriesTable.id}) - 1) <= 0`);
                    await tx.delete(categoriesTable)
                        .where(inArray(categoriesTable.id, subquery))

                    await tx.delete(problemsToCategoriesTable)
                        .where(and(
                            eq(problemsToCategoriesTable.problem_id, id),
                            inArray(problemsToCategoriesTable.category_id,
                                tx.select({ id: categoriesTable.id })
                                    .from(problemsToCategoriesTable)
                                    .leftJoin(categoriesTable, eq(categoriesTable.id, problemsToCategoriesTable.category_id))
                                    .where(and(
                                        inArray(categoriesTable.category, deleteCategories),
                                        eq(problemsToCategoriesTable.problem_id, id)
                                    ))

                            )
                        ))
                }

                if (addCategories.length > 0) {
                    await tx.insert(categoriesTable).values(addCategories.map((category) => ({ category }))).onConflictDoNothing();
                    const categoriesID = await tx.select({ id: categoriesTable.id }).from(categoriesTable).where(inArray(categoriesTable.category, addCategories));
                    await tx.insert(problemsToCategoriesTable).values(categoriesID.map((cat) => ({
                        problem_id: id,
                        category_id: cat.id
                    })));
                }
            }

            const fieldsToUpdate: any = {};
            if (payload.problem) fieldsToUpdate.problem = payload.problem;
            if (payload.description) fieldsToUpdate.description = payload.description;
            if (payload.like !== undefined) fieldsToUpdate.like = payload.like;
            if (payload.dislike !== undefined) fieldsToUpdate.dislike = payload.dislike;
            if (payload.difficulty) fieldsToUpdate.difficulty = payload.difficulty;
            if (Object.keys(fieldsToUpdate).length > 0) {
                await tx.update(problemsTable).set(fieldsToUpdate).where(eq(problemsTable.id, id));
            }

            return true;
        })

        return updateResult;
    }

    public async delete(id: number): Promise<boolean> {
        const deleteResult = await this.connection.transaction(async (tx) => {
            await tx.delete(categoriesTable)
                    .where(inArray(categoriesTable.id,
                        tx.select({ id: categoriesTable.id })
                            .from(problemsToCategoriesTable)
                            .leftJoin(categoriesTable, eq(categoriesTable.id, problemsToCategoriesTable.category_id))
                            .where(inArray(categoriesTable.id,
                                tx.select({ id: problemsToCategoriesTable.category_id })
                                    .from(problemsToCategoriesTable)
                                    .where(eq(problemsToCategoriesTable.problem_id, id))
                            ))
                            .groupBy(categoriesTable.id)
                            .having(sql`(COUNT(${categoriesTable.id}) - 1) <= 0`)
                    ))
            const result = await tx.delete(problemsTable).where(eq(problemsTable.id, id)).returning();
            if (result.length === 0) throw new Error("Problem not found");

            return true;
        });

        return deleteResult;
    }

    private mapToProblemEntity(dbRecord: any): Problem {
        return {
            id: dbRecord.id,
            problem: dbRecord.problem,
            description: dbRecord.description,
            like: dbRecord.like,
            dislike: dbRecord.dislike,
            difficulty: dbRecord.difficulty,

            hints: dbRecord.hintsTable ? dbRecord.hintsTable.map((hintObj: { hint: any; }) => hintObj.hint) : [],
            categories: dbRecord.problemsToCategoriesTable
                ? dbRecord.problemsToCategoriesTable.map((ptc: { categoriesTable: { category: any; }; }) => ptc.categoriesTable.category)
                : []
        }
    }
}
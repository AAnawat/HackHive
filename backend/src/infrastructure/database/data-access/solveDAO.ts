import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type ISolveDAO from "../../../interfaces/DAO/solveDAO";
import { and, eq } from "drizzle-orm";
import * as schema from '../schema'
import { 
    solvedRecordsTable,
    problemsTable
} from "../schema";


export default class SolveDAO implements ISolveDAO {
    private connection!: NodePgDatabase<typeof schema>;

    constructor(connection: NodePgDatabase<typeof schema>) {
        this.connection = connection;
    }


    public async solvedProblem(userId: number, problemId: number): Promise<boolean> {
        const insertResult = await this.connection.transaction(async (tx) => {
            const problemResult = await tx.select()
                .from(problemsTable)
                .where(eq(problemsTable.id, problemId));
            if (problemResult.length <= 0) throw new Error("Problem not found");
            else { var currentScore = problemResult[0].score; }

            await tx.insert(solvedRecordsTable)
                .values({
                    user_id: userId,
                    problem_id: problemId,
                    solve_score: currentScore
                });

            await tx.update(problemsTable)
                .set({score: currentScore - 1})
                .where(eq(problemsTable.id, problemId));

            return true;
        })

        return insertResult;
    }

    public async voteProblem(userId: number, problemId: number, isLiked: boolean): Promise<boolean> {
        const voteResult = await this.connection.transaction(async (tx) => {
            const solveResult = await tx.select({ id: solvedRecordsTable.id })
                .from(solvedRecordsTable)
                .where(and(eq(solvedRecordsTable.user_id, userId), eq(solvedRecordsTable.problem_id, problemId)));
            if (solveResult.length < 0) throw new Error("Solve problem first before voting");
            else { var solveID = solveResult[0].id; }
            
            const existingVote = await tx.select()
                .from(schema.usersLikeProblemsTable)
                .where(eq(schema.usersLikeProblemsTable.solve_id, solveID));
            if (existingVote.length > 0) {
                await tx.update(schema.usersLikeProblemsTable)
                        .set({ is_like: isLiked })
                        .where(eq(schema.usersLikeProblemsTable.solve_id, solveID));
                return true;
            } else {
                await tx.insert(schema.usersLikeProblemsTable)
                        .values({
                            solve_id: solveID,
                            is_like: isLiked
                        })
                return true;
            }

        })

        return voteResult;
    }
}
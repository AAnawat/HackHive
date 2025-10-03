export default interface ISolveDAO {
    solvedProblem(userId: number, problemId: number): Promise<boolean>
    voteProblem(userId: number, problemId: number, isLiked: boolean): Promise<boolean>
    findByUserAndProblem(userId: number, problemId: number): Promise<{ id: number; solve_score: number } | undefined>
    create(data: { user_id: number; problem_id: number; solve_score: number }): Promise<boolean>
}
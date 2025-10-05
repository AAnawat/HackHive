export default interface ISolveDAO {
    solvedProblem(userId: number, problemId: number): Promise<number>
    voteProblem(userId: number, problemId: number, isLiked: boolean): Promise<boolean>
    checkSolveExists(userId: number, problemId: number): Promise<boolean>
}
export default interface ISolveDAO {
    solvedProblem(userId: number, problemId: number): Promise<boolean>
    voteProblem(userId: number, problemId: number, isLiked: boolean): Promise<boolean>
}
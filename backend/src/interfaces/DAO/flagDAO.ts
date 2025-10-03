export default interface IFlagDAO {
    getByProblemId(problemId: number): Promise<{ flag_value: string; is_case_sensitive: boolean } | undefined>;
}


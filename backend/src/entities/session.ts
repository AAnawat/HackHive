export default interface Session {
    id: number;
    user_id: number;
    problem_id: number;
    flag: string;
    status: "Running" | "Pending" | "Terminated" | "Error";
    task_arn?: string;
    ip_address?: string;
    started_at?: Date;
    ended_at?: Date;
}
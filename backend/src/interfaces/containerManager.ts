export default interface IContainerManager {
    // Launch a problem container, return its id (ECS task ARN or Docker container id)
    createContainer(taskDefinition: string, environment: Record<string, string>): Promise<string>;
    waitContainer(containerId: string): Promise<void>;
    // Address the frontend connects to, "host" (port 1234 implied) or "host:port"
    getContainerAddress(containerId: string): Promise<string>;
    deleteContainer(containerId: string, reason: string): Promise<void>;
}

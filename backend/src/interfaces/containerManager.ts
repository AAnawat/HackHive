import type { RunTaskCommandOutput, StopTaskCommandOutput } from "@aws-sdk/client-ecs";
import type { WaiterResult } from "@smithy/util-waiter";

export default interface IContainerManager {
    createContainer(taskDefinition: string, subnet: string, securityGroups: string, override: any): Promise<RunTaskCommandOutput>;
    waitContainer(taskArn: string): Promise<WaiterResult>;
    describeContainer(taskArn: string): Promise<RunTaskCommandOutput>;
    deleteContainer(task: string, reason: string): Promise<StopTaskCommandOutput>;
}
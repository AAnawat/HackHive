import type IContainerManager from "../../interfaces/containerManager";
import ecsConfig from "../../config/ecsConfig";
import { 
    DescribeTasksCommand,
    LaunchType,
    RunTaskCommand,
    StopTaskCommand,
    waitUntilTasksRunning,
    type ECSClient,
    type RunTaskCommandOutput,
    type StopTaskCommandOutput 
} from "@aws-sdk/client-ecs";
import type { WaiterResult } from "@smithy/util-waiter";

export default class ContainerManager implements IContainerManager {
    private ecsClient: ECSClient;

    constructor(ecsClient: ECSClient) {
        this.ecsClient = ecsClient;
    }


    public async createContainer(taskDefinition: string, subnet: string, securityGroups: string, override: any): Promise<RunTaskCommandOutput> {
        const command = new RunTaskCommand({
            cluster: ecsConfig.cluster,
            taskDefinition: taskDefinition,
            launchType: ecsConfig.launchType as LaunchType,
            tags: [
                {
                    key: "container_role",
                    value: "problem"
                }
            ],
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [ subnet ],
                    assignPublicIp: "ENABLED",
                    securityGroups: [ securityGroups ]
                }
            },
            overrides: override
        })

        return await this.ecsClient.send(command)
    }
    
    public async waitContainer(taskArn: string): Promise<WaiterResult> {
        const result = await waitUntilTasksRunning(
            { client: this.ecsClient, maxWaitTime: 300 },
            { cluster: ecsConfig.cluster, tasks: [taskArn] }
        )
        return result
    }

    public async describeContainer(taskArn: string): Promise<RunTaskCommandOutput> {
        const command = new DescribeTasksCommand({
            cluster: ecsConfig.cluster,
            tasks: [ taskArn ]
        })

        return await this.ecsClient.send(command)
    }
    
    public async deleteContainer(task: string, reason: string): Promise<StopTaskCommandOutput> {
        const command = new StopTaskCommand({
            cluster: ecsConfig.cluster,
            task: task,
            reason: reason
        })

        return await this.ecsClient.send(command)
        
    }
}
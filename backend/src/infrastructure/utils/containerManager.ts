import type IContainerManager from "../../interfaces/containerManager";
import type ICloudQuery from "../../interfaces/cloudQuery";
import ecsConfig from "../../config/ecsConfig";
import {
    DescribeTasksCommand,
    LaunchType,
    RunTaskCommand,
    StopTaskCommand,
    waitUntilTasksRunning,
    type ECSClient,
} from "@aws-sdk/client-ecs";

export default class ContainerManager implements IContainerManager {
    private ecsClient: ECSClient;
    private cloudQuery: ICloudQuery;

    constructor(ecsClient: ECSClient, cloudQuery: ICloudQuery) {
        this.ecsClient = ecsClient;
        this.cloudQuery = cloudQuery;
    }


    public async createContainer(taskDefinition: string, environment: Record<string, string>): Promise<string> {
        const availableSubnets = await this.cloudQuery.findAvailableSubnet([
            { Name: "tag:role", Values: ["problem-subnet"] },
        ])
        const selectedSubnet = availableSubnets[Math.floor(Math.random() * availableSubnets.length)];

        const securityGroup = await this.cloudQuery.findSecurityGroup([
            { Name: "tag:role", Values: ["problem-sg"] },
        ]);

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
                    subnets: [ selectedSubnet ],
                    assignPublicIp: "ENABLED",
                    securityGroups: [ securityGroup ]
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: taskDefinition.split(":")[0],
                        environment: Object.entries(environment).map(([name, value]) => ({ name, value }))
                    }
                ]
            }
        })

        const response = await this.ecsClient.send(command)
        const taskArn = response.tasks?.[0]?.taskArn;
        if (!taskArn)
            throw new Error("Failed to launch container");

        return taskArn
    }

    public async waitContainer(taskArn: string): Promise<void> {
        await waitUntilTasksRunning(
            { client: this.ecsClient, maxWaitTime: 300 },
            { cluster: ecsConfig.cluster, tasks: [taskArn] }
        )
    }

    public async getContainerAddress(taskArn: string): Promise<string> {
        const command = new DescribeTasksCommand({
            cluster: ecsConfig.cluster,
            tasks: [ taskArn ]
        })
        const containerDesc = await this.ecsClient.send(command)
        if (!containerDesc.tasks || containerDesc.tasks.length === 0)
            throw new Error("Failed to describe container");

        const containerInterface = await this.cloudQuery.findNetworkInterface(
            containerDesc.tasks[0].attachments?.[0].details?.find(detail => detail.name === "networkInterfaceId")?.value || ""
        )

        const publicIp = containerInterface.Association?.PublicIp;
        if (!publicIp)
            throw new Error("Failed to get public IP");

        return publicIp
    }

    public async deleteContainer(task: string, reason: string): Promise<void> {
        const command = new StopTaskCommand({
            cluster: ecsConfig.cluster,
            task: task,
            reason: reason
        })

        await this.ecsClient.send(command)
    }
}

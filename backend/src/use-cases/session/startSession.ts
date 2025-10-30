import type Session from "../../entities/session";
import type IContainerManager from "../../interfaces/containerManager";
import type ISessionDAO from "../../interfaces/DAO/sessionDAO";
import type ICloudQuery from "../../interfaces/cloudQuery";
import type { IValidator } from "../../interfaces/validator";
import type IProblemDAO from "../../interfaces/DAO/problemDAO";


export default class StartSession {
    private sessionDAO: ISessionDAO;
    private problemDAO: IProblemDAO;
    private containerManager: IContainerManager;
    private validator: IValidator;
    private cloudQuery: ICloudQuery

    constructor(sessionDAO: ISessionDAO, problemDAO: IProblemDAO, containerManager: IContainerManager, awsQuery: ICloudQuery, validator: IValidator) {
        this.sessionDAO = sessionDAO;
        this.problemDAO = problemDAO;
        this.containerManager = containerManager;
        this.cloudQuery = awsQuery;
        this.validator = validator;
    }


    public async call(input: { userId: number, problemId: number }): Promise<Session> {
        // Check if user already has an opened session
        const openedSessions = await this.sessionDAO.get({ userId: input.userId, status: "Running" });
        if (openedSessions.length >= 1) 
            throw new Error("User already has an opened session");

        // Create session, Validate input data
        const flag = this.generateFlags(16);
        const payload = { ...input, flag };

        const validation = this.validator.validate(payload);
        if (validation.error) 
            throw new Error("Invalid input data");

        const createdSession = await this.sessionDAO.create(
            validation.data.userId,
            validation.data.problemId,
            validation.data.flag
        );
        if (!createdSession)
            throw new Error("Failed to create session");



        // Get relate data for launching container
        const availableSubnets = await this.cloudQuery.findAvailableSubnet([
            { Name: "tag:role", Values: ["problem-subnet"] },
        ])
        if (availableSubnets.length === 0) 
            throw new Error("No available subnets found");
        const selectedSubnet = availableSubnets[Math.floor(Math.random() * availableSubnets.length)];

        const securityGroup = await this.cloudQuery.findSecurityGroup([
            { Name: "tag:role", Values: ["problem-sg"] },
        ]);
        if (!securityGroup)
            throw new Error("No security group found");

        const problem = await this.problemDAO.findOne(input.problemId);
        if (!problem)
            throw new Error("Problem not found");

        const override = {
            containerOverrides: [
                {
                    name: problem.task_definition.split(":")[0],
                    environment: [
                        { name: "FLAG", value: createdSession.flag }
                    ]
                }
            ]
        }


        // Launch container
        const launchResponse = this.containerManager.createContainer(
            problem.task_definition,
            selectedSubnet,
            securityGroup,
            override
        )
        launchResponse.then(async (response) => {
            if (!response.tasks || response.tasks.length === 0)
                throw new Error("Failed to launch container");

            const taskArn = response.tasks[0].taskArn;
            if (!taskArn)
                throw new Error("Failed to get task ARN");

            await this.containerManager.waitContainer(taskArn);
            const containerDesc = await this.containerManager.describeContainer(taskArn);
            if (!containerDesc.tasks || containerDesc.tasks.length === 0)
                throw new Error("Failed to describe container");

            const containerInterface = await this.cloudQuery.findNetworkInterface(
                containerDesc.tasks[0].attachments?.[0].details?.find(detail => detail.name === "networkInterfaceId")?.value || ""
            )
            if (!containerInterface)
                throw new Error("Failed to get network interface");

            const publicIp = containerInterface.Association?.PublicIp;
            if (!publicIp)
                throw new Error("Failed to get public IP");

            const updateResult = await this.updateSession(createdSession.id, taskArn, publicIp);
            if (!updateResult)
                throw new Error("Failed to update session");

        }).catch(err => {
            this.sessionDAO.update(createdSession.id, { status: "Error" });
            console.error("Error: ", err);
        })

        return createdSession;
    }

    private generateFlags(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    private async updateSession(sessionId: number, taskArn: string, ip: string): Promise<boolean> {
        const updateResult = await this.sessionDAO.update(sessionId, {
            task_arn: taskArn,
            ip_address: ip,
            status: "Running"
        })
        return updateResult;
    }
}
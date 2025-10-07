import { StopTaskCommand } from "@aws-sdk/client-ecs";
import ecsClient from "../ecs/index.js";

export default async function stopTask(taskList) {

        for (const task of taskList) {
            await ecsClient.send(
                new StopTaskCommand({
                    cluster: process.env.AWS_ECS_CLUSTER,
                    task: task,
                    reason: "Time limit exceeded",
                })
            );
        }

}

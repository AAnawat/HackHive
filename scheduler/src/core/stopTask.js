import { StopTaskCommand } from "@aws-sdk/client-ecs";
import ecsClient from "../ecs/index.js";
import stopContainer from "../docker/index.js";

export default async function stopTask(taskList) {

        for (const task of taskList) {
            // Sessions that failed to launch have no task
            if (!task) continue;

            if (process.env.CLOUD_PROVIDER === "local") {
                await stopContainer(task);
                continue;
            }

            await ecsClient.send(
                new StopTaskCommand({
                    cluster: process.env.AWS_ECS_CLUSTER,
                    task: task,
                    reason: "Time limit exceeded",
                })
            );
        }

}

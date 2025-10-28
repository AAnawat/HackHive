import { ECS, ECSClient } from "@aws-sdk/client-ecs";
import "dotenv/config"

let client: ECSClient;
if (process.env.NODE_ENV === 'production') {
    client = new ECSClient({ region: process.env.AWS_REGION });
} else {
    client = new ECSClient({
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    })
}
export default client;
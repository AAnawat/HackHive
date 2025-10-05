import { ECSClient } from "@aws-sdk/client-ecs";

const client = new ECSClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: "",
        secretAccessKey: "",
        sessionToken: ""
    }
})
export default client;
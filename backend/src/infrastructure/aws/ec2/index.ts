import { EC2Client } from "@aws-sdk/client-ec2";

const client = new EC2Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: "",
        secretAccessKey: "",
        sessionToken: ""
    }
})
export default client;
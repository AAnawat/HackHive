import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: "",
        secretAccessKey: "",
        sessionToken: ""
    }
});
// TODO: For test purposes only. Use IAM roles for production.
export default client;

import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config"

let client: S3Client;
if (process.env.NODE_ENV === 'production') {
    client = new S3Client({ region: process.env.AWS_REGION });
} else {
    client = new S3Client({
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN
        }
    })
}
export default client;

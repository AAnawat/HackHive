import type IPictureManager from "../../interfaces/pictureManager";
import s3Config from "../../config/s3Config";
import { 
    PutObjectCommand,
    DeleteObjectCommand,
    waitUntilObjectNotExists,
    type S3Client
} from "@aws-sdk/client-s3";

export default class PictureManager implements IPictureManager {
    private s3Client: S3Client;

    constructor(s3Client: S3Client) {
        this.s3Client = s3Client;
    }


    public async savePicture(image: File, s3_name: string): Promise<boolean> {
        // const localPath = path.join(process.cwd(), "uploads", imageName);
        // const fileContent = readFileSync(localPath);
        const uploadResult = await this.s3Client.send(
            new PutObjectCommand({
                Bucket: s3Config.bucket,
                Key: `profile-pictures/${s3_name}`,
                Body: Buffer.from(await image.arrayBuffer()),
            })
        )

        return uploadResult.$metadata.httpStatusCode === 200;
    }

    public async deletePicture(s3_name: string): Promise<boolean> {
        const deleteResult = await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: s3Config.bucket,
                Key: `profile-pictures/${s3_name}`,
            })
        )
        const waitResult = await waitUntilObjectNotExists(
            { client: this.s3Client, maxWaitTime: 30 },
            { Bucket: s3Config.bucket, Key: `profile-pictures/${s3_name}` }
        )

        return deleteResult.$metadata.httpStatusCode === 204;
    }
}
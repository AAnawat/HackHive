import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type IPictureManager from "../../interfaces/pictureManager";
import pictureManagerConfig from "../../config/pictureManagerConfig";

// Stores profile pictures on local disk instead of S3, served at /api/uploads
export default class LocalPictureManager implements IPictureManager {
    private directory: string;

    constructor(directory: string = pictureManagerConfig.localDirectory) {
        this.directory = directory;
        mkdirSync(this.directory, { recursive: true });

        const defaultPicture = path.join(this.directory, "default.png");
        if (!existsSync(defaultPicture))
            copyFileSync("assets/default-profile.png", defaultPicture);
    }


    public async savePicture(image: File, name: string): Promise<boolean> {
        await writeFile(this.filePath(name), Buffer.from(await image.arrayBuffer()));
        return true;
    }

    public async deletePicture(name: string): Promise<boolean> {
        await rm(this.filePath(name), { force: true });
        return true;
    }

    private filePath(name: string): string {
        // Names come from stored URLs, keep them inside the upload directory
        return path.join(this.directory, path.basename(name));
    }
}

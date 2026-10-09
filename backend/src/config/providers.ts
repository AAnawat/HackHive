import provider from "./cloudProvider";
import type IContainerManager from "../interfaces/containerManager";
import type IPictureManager from "../interfaces/pictureManager";
import ContainerManager from "../infrastructure/utils/containerManager";
import DockerContainerManager from "../infrastructure/utils/dockerContainerManager";
import CloudQuery from "../infrastructure/utils/cloudQuery";
import PictureManager from "../infrastructure/utils/pictureManager";
import LocalPictureManager from "../infrastructure/utils/localPictureManager";
import ecsClient from "../infrastructure/aws/ecs";
import ec2Client from "../infrastructure/aws/ec2";
import s3Client from "../infrastructure/aws/s3";

const containerManager: IContainerManager = provider === "local"
    ? new DockerContainerManager()
    : new ContainerManager(ecsClient, new CloudQuery(ec2Client));

const pictureManager: IPictureManager = provider === "local"
    ? new LocalPictureManager()
    : new PictureManager(s3Client);

console.log(`Cloud provider: ${provider}`);

export default { containerManager, pictureManager }

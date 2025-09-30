export default interface IPictureManager {
    savePicture(image: File, imageName: string): Promise<boolean>;
    deletePicture(s3_name: string): Promise<boolean>;
}
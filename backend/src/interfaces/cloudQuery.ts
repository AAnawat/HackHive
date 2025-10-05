import type { NetworkInterface } from "@aws-sdk/client-ec2";

export default interface ICloudQuery {
    findAvailableSubnet(filter: {Name: string, Values: string[]}[]): Promise<string[]>;
    findSecurityGroup(filter: {Name: string, Values: string[]}[]): Promise<string>;
    findNetworkInterface(networkInterfaceId: string): Promise<NetworkInterface>;
}
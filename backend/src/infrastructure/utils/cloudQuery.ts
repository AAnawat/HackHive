import type { EC2Client, NetworkInterface } from "@aws-sdk/client-ec2";
import type ICloudQuery from "../../interfaces/cloudQuery";
import {
    DescribeNetworkInterfacesCommand,
    DescribeSecurityGroupsCommand,
    DescribeSubnetsCommand,
} from "@aws-sdk/client-ec2";


export default class CloudQuery implements ICloudQuery {
    private EC2Client: EC2Client;

    constructor(EC2Client: EC2Client) {
        this.EC2Client = EC2Client;
    }

    
    public async findAvailableSubnet(filter: {Name: string, Values: string[]}[]): Promise<string[]> {
        const command = new DescribeSubnetsCommand({ Filters: filter });
        const response = await this.EC2Client.send(command);
        
        response.Subnets.filter(subnet => subnet.AvailableIpAddressCount > 0);
        
        if (!response.Subnets || response.Subnets.length === 0) 
            throw new Error("No available subnets found");
        
        return response.Subnets.map(subnet => subnet.SubnetId);
    }
    
    public async findSecurityGroup(filter: {Name: string, Values: string[]}[]): Promise<string> {
        const command = new DescribeSecurityGroupsCommand({ Filters: filter });
        const response = await this.EC2Client.send(command);
        
        if (!response.SecurityGroups || response.SecurityGroups.length === 0) 
            throw new Error("No security groups found");
        
        if (response.SecurityGroups.length > 1)
            throw new Error("Multiple security groups found");
        
        return response.SecurityGroups[0].GroupId;
    }

    public async findNetworkInterface(networkInterfaceId: string): Promise<NetworkInterface> {
        const command = new DescribeNetworkInterfacesCommand({ NetworkInterfaceIds: [networkInterfaceId] });
        const response = await this.EC2Client.send(command);

        if (!response.NetworkInterfaces || response.NetworkInterfaces.length === 0)
            throw new Error("No network interface found");

        return response.NetworkInterfaces[0];
    }
}
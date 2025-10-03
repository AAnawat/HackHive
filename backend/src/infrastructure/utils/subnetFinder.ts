import type { EC2Client } from "@aws-sdk/client-ec2";
import type ISubnetFinder from "../../interfaces/subnetFinder";
import {
    DescribeSubnetsCommand,
} from "@aws-sdk/client-ec2";

class SubnetFinder implements ISubnetFinder {
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
}
export default interface ISubnetFinder {
    findAvailableSubnet(filter: {Name: string, Values: string[]}[]): Promise<string[]>;
}
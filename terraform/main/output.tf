output "vpc_id" {
    description = "The ID of the VPC"
    value       = module.vpc.vpc_id
}

output "public_subnet" {
    description = "The IDs of the public subnets"
    value       = module.vpc.public_subnets
}

output "private_subnet" {
    description = "The IDs of the private subnets"
    value       = module.vpc.private_subnets
}

output "backend_sg_id" {
    description = "The ID of the backend security group"
    value       = module.backend-sg.security_group_id
}
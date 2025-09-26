module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "HackHive-vpc"
  cidr = "10.0.0.0/16"

  azs              = var.subnet
  public_subnets   = ["10.0.11.0/24", "10.0.21.0/24", "10.0.12.0/24", "10.0.22.0/24"]
  private_subnets  = ["10.0.101.0/24", "10.0.201.0/24"]
  database_subnets = ["10.0.111.0/24", "10.0.211.0/24"]

  map_public_ip_on_launch = true
}

////////////////////////////
// subnet group for database
////////////////////////////
resource "aws_db_subnet_group" "rds_group" {
  name       = "rds_group"
  subnet_ids = module.vpc.database_subnets
}
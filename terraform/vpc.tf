module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "HackHive-vpc"
  cidr = "10.0.0.0/16"

  azs              = var.subnet
  public_subnets   = ["10.0.11.0/24", "10.0.12.0/24"]
  private_subnets  = ["10.0.101.0/24", "10.0.201.0/24"]
  database_subnets = ["10.0.111.0/24", "10.0.211.0/24"]
}

resource "aws_subnet" "public_problem" {
  count = 2
  vpc_id = module.vpc.vpc_id
  cidr_block = "10.0.2${count.index}.0/24"
  availability_zone = var.subnet[count.index]
  map_public_ip_on_launch = true

  tags = {
    role = "problem-subnet"
  }
}

resource "aws_route_table_association" "route_table_attach" {
  count = 2
  subnet_id = aws_subnet.public_problem[count.index].id
  route_table_id = module.vpc.public_route_table_ids[0]
}

////////////////////////////
// subnet group for database
////////////////////////////
resource "aws_db_subnet_group" "rds_group" {
  name       = "rds_group"
  subnet_ids = module.vpc.database_subnets
}
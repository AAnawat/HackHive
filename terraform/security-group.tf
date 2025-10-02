// Backend server security group
module "backend-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "backend_sg"
  description = "Allow traffic to access backend service"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      rule        = "http-80-tcp"
      cidr_blocks = "0.0.0.0/0"
      self        = false
      description = "Allow HTTP access from anywhere"
    }
  ]
}


// database security group
module "rds-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "rds_sg"
  description = "Allow traffic to access RDS"
  vpc_id      = module.vpc.vpc_id

  ingress_with_source_security_group_id = [
    {
      rule                     = "postgresql-tcp"
      source_security_group_id = module.backend-sg.security_group_id
      self                     = false
      description              = "Allow backend to access RDS"
    }
  ]
}

// Problem container security group
module "problem-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "problem_sg"
  description = "Allow traffic to access problem service"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      rule        = "ssh-tcp"
      cidr_blocks = "0.0.0.0/0"
      self        = false
      description = "Allow SSH access from anywhere"
    }
  ]
}
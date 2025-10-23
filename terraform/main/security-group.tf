// Backend server security group
module "backend-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "backend_sg"
  description = "Allow traffic to access backend service"
  vpc_id      = module.vpc.vpc_id

  tags = local.default_tag

  ingress_with_cidr_blocks = [
    {
      rule        = "http-80-tcp"
      cidr_blocks = "0.0.0.0/0"
      self        = false
      description = "Allow HTTP access from anywhere"
    }
  ]

  egress_with_cidr_blocks = [
    {
      rule        = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}


// database security group
module "rds-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "rds_sg"
  description = "Allow traffic to access RDS"
  vpc_id      = module.vpc.vpc_id

  tags = local.default_tag

  ingress_with_source_security_group_id = [
    {
      rule                     = "postgresql-tcp"
      source_security_group_id = module.backend-sg.security_group_id
      self                     = false
      description              = "Allow backend to access RDS"
    },
    {
      rule                     = "postgresql-tcp"
      source_security_group_id = module.scheduler-sg.security_group_id
      self                     = false
      description              = "Allow scheduler to access RDS"
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
    },
    {
      from_port   = 1234
      to_port     = 1234
      protocol    = "tcp"
      cidr_blocks = "0.0.0.0/0"
      self        = false
      description = "Allow HTTP access from anywhere"
    }
  ]

  egress_with_cidr_blocks = [
    {
      rule        = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]

  tags = {
    role        = "problem-sg"
    project     = local.default_tag.project
    environment = local.default_tag.environment
  }
}

// Scheduler task security group
module "scheduler-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "scheduler-sg"
  description = "Allow traffic from scheduler to everywhere"
  vpc_id      = module.vpc.vpc_id

  tags = local.default_tag

  egress_with_cidr_blocks = [
    {
      rule        = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}

module "lb-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "lb_sg"
  description = "Allow traffic to access load balancer"
  vpc_id      = module.vpc.vpc_id

  tags = local.default_tag

  ingress_with_cidr_blocks = [
    {
      rule        = "http-80-tcp"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
  egress_with_cidr_blocks = [
    {
      rule        = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}
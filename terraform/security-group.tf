// database security group
module "rds_sg" {
  source = "terraform-aws-modules/security-group/aws//modules/postgresql"

  name        = "rds_sg"
  description = "Allow traffic to access RDS"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      rule        = "postgresql-tcp"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}

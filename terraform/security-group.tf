// database security group
module "rds_sg" {
  source = "terraform-aws-modules/security-group/aws//modules/postgresql"

  name        = "rds_sg"
  description = "Allow traffic to access RDS"
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks = [module.vpc.vpc_cidr_block]
  ingress_rules       = ["postgresql-tcp"]
}

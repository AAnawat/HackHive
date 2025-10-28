module "lb-sg" {
  source = "terraform-aws-modules/security-group/aws"

  name        = "lb_sg"
  description = "Allow traffic to access load balancer"
  vpc_id      = var.vpc_id

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
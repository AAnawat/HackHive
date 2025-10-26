data "aws_ami" "amazon-linux-ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["137112412989"] # Amazon
}

resource "aws_instance" "dev-server" {
  ami                         = data.aws_ami.amazon-linux-ami.id
  instance_type               = "t3.small"
  key_name                    = "vockey"
  subnet_id                   = module.vpc.public_subnets[0]
  associate_public_ip_address = true
  security_groups             = [module.backend-sg.security_group_id]
  iam_instance_profile        = data.aws_iam_instance_profile.LabInstanceProfile.name

  tags = merge(
    local.default_tag,
    { Name = "dev-server" }
  )

  user_data = templatefile(
    "./assets/scripts/backend-init.sh.tpl",
    {
      DATABASE_URL = "postgresql://${var.database_user}:${var.database_pass}@${aws_db_instance.hackhive_db.address}:${aws_db_instance.hackhive_db.port}/${aws_db_instance.hackhive_db.db_name}?sslmode=no-verify"
      DB_HOST      = aws_db_instance.hackhive_db.address
      DB_PORT      = aws_db_instance.hackhive_db.port
      DB_DATABASE  = aws_db_instance.hackhive_db.db_name
      DB_USER      = var.database_user
      DB_PASS      = var.database_pass
      REGION       = var.region
      JWT_SECRET   = var.jwt_secret
      ADMIN_TOKEN  = var.admin_token
    }
  )
  depends_on = [aws_db_instance.hackhive_db]
}
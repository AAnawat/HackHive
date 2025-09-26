data "aws_rds_engine_version" "postgres" {
  engine  = "postgres"
  version = "17.4"
}

resource "aws_db_instance" "hackhive_db" {
  allocated_storage   = 20
  db_name             = "hackhive_db"
  identifier          = "hackhive"
  engine              = data.aws_rds_engine_version.postgres.engine
  engine_version      = data.aws_rds_engine_version.postgres.version
  instance_class      = "db.t3.small"
  username            = var.database_user
  password            = var.database_pass
  skip_final_snapshot = true

  multi_az             = true
  db_subnet_group_name = aws_db_subnet_group.rds_group.name

  vpc_security_group_ids = [
    module.rds_sg.security_group_id
  ]
}
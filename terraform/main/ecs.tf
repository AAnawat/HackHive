resource "aws_ecs_cluster" "hackhive-cluster" {
  name = "hackhive-cluster"

  tags = local.default_tag
}

resource "aws_ecs_cluster_capacity_providers" "fargate-cluster" {
  cluster_name       = aws_ecs_cluster.hackhive-cluster.name
  capacity_providers = ["FARGATE"]
}

resource "aws_ecs_task_definition" "scheduler" {
  family                   = "scheduler"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = data.aws_iam_role.LabRole.arn
  cpu                      = "1024"
  memory                   = "2048"
  task_role_arn            = data.aws_iam_role.LabRole.arn

  tags = local.default_tag

  container_definitions = jsonencode([
    {
      name      = "scheduler"
      image     = "aunanawat/hackhive-scheduler"
      essential = true

      environment = [
        {
          name  = "AWS_ECS_CLUSTER"
          value = aws_ecs_cluster.hackhive-cluster.name
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${var.database_user}:${var.database_pass}@${aws_db_instance.hackhive_db.address}:5432/${aws_db_instance.hackhive_db.db_name}?sslmode=require"
        },
        {
          name  = "AWS_REGION"
          value = var.region
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
    }
  ])
  depends_on = [aws_db_instance.hackhive_db]
}

resource "aws_ecs_service" "scheduler-service" {
  name            = "scheduler-service"
  cluster         = aws_ecs_cluster.hackhive-cluster.id
  task_definition = aws_ecs_task_definition.scheduler.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  tags = merge(local.default_tag, { container_role = "scheduler" })

  network_configuration {
    subnets          = module.vpc.public_subnets
    security_groups  = [module.scheduler-sg.security_group_id]
    assign_public_ip = true
  }

  depends_on = [aws_ecs_cluster_capacity_providers.fargate-cluster]
}
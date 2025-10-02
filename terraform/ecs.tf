resource "aws_ecs_cluster" "hackhive-cluster" {
  name = "hackhive-cluster"
}

resource "aws_ecs_cluster_capacity_providers" "fargate-cluster" {
  cluster_name       = aws_ecs_cluster.hackhive-cluster.name
  capacity_providers = ["FARGATE"]
}
resource "aws_lb_target_group" "hackhive-tg" {
  name     = "hackhive-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  tags = local.default_tag

  health_check {
    path                = "/api/health"
    protocol            = "HTTP"
    matcher             = "200-302"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }
}

resource "aws_lb" "hackhive-lb" {
  name               = "hackhive-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.lb-sg.security_group_id]
  subnets            = var.public_subnet

  tags = local.default_tag
}

resource "aws_lb_listener" "hackhive-listener" {
  load_balancer_arn = aws_lb.hackhive-lb.arn
  port              = "80"
  protocol          = "HTTP"

  tags = local.default_tag

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.hackhive-tg.arn
  }
}
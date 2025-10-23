data "aws_ami" "hackhive-ami" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "name"
    values = [var.ami_name]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_launch_template" "backend-template" {
  name                   = "backend-template"
  image_id               = data.aws_ami.hackhive-ami.id
  instance_type          = "t3.small"
  vpc_security_group_ids = [ var.backend_sg_id ]

  iam_instance_profile {
    name = data.aws_iam_instance_profile.LabInstanceProfile.name
  }

  tags = local.default_tag
}

resource "aws_autoscaling_group" "backend-asg" {
  desired_capacity    = 2
  max_size            = 2
  min_size            = 2
  vpc_zone_identifier = var.private_subnet

  launch_template {
    id      = aws_launch_template.backend-template.id
    version = "$Latest"
  }

  target_group_arns         = [aws_lb_target_group.hackhive-tg.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "backend-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_policy" "scaling" {
  name                   = "backend-scaling-policy"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.backend-asg.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 80.0
  }
}
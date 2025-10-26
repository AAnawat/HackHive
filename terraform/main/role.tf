data "aws_iam_role" "LabRole" {
  name = "LabRole"
}

data "aws_iam_instance_profile" "LabInstanceProfile" {
  name = "LabInstanceProfile"
}
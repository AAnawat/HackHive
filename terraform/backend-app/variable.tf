###########################
# Terraform Variables
###########################

# Cloud Provider Credentials
variable "access_key" {
  description = "access-key for access cloud environment"
  type        = string
}
variable "secret_key" {
  description = "secret-key for access cloud environment"
  type        = string
}
variable "token" {
  description = "Session token in learner lab"
  type        = string
}

# Environment Configuration
variable "region" {
  description = "Region use to set up environment"
  type        = string
  default     = "us-east-1"
}

# AMI Configuration
variable "ami_id" {
  description = "Name of AMI"
  type        = string
  default     = "My-HackHive"
}

# VPC Configuration
variable "vpc_id" {
  description = "This project need two subnet to set up"
  type        = string
}
variable "public_subnet" {
  description = "Public subnet ID for backend server"
  type        = list(string)
}
variable "private_subnet" {
  description = "Private subnet ID for backend server"
  type        = list(string)
}

# Security group Configuration
variable "backend_sg_id" {
  description = "Security group ID for backend server"
  type        = string
}
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
variable "subnet" {
  description = "This project need two subnet to set up"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Database Configuration
variable "database_user" {
  description = "Username for RDS"
  type        = string
}
variable "database_pass" {
  description = "Password for RDS"
  type        = string
  sensitive   = true
}

# Backend Configuration
variable "jwt_secret" {
  description = "JWT Secret for backend"
  type        = string
}
variable "admin_token" {
  description = "Admin token for backend"
  type        = string
}
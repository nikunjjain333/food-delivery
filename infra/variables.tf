variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for tagging"
  default     = "rohit-sweets"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Deployment environment"
  default     = "dev"
}

variable "db_password" {
  description = "Database administrator password"
  sensitive   = true
}

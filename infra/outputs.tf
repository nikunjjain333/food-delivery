output "alb_hostname" {
  value       = aws_lb.main.dns_name
  description = "The DNS name of the ALB"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The connection endpoint for RDS"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.assets.id
  description = "The name of the S3 bucket for assets"
}

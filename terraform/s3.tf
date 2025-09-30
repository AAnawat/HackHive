module "s3_bucket" {
  source                   = "terraform-aws-modules/s3-bucket/aws"
  bucket                   = "hackhive"
  control_object_ownership = true
  object_ownership         = "BucketOwnerEnforced"

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false

  cors_rule = [
    {
      allowed_methods = ["GET", "PUT", "POST", "DELETE"]
      allowed_origins = ["http://localhost:5173"]
      allowed_headers = ["*"]
      expose_headers  = []
      max_age_seconds = 3000
    }
  ]
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = module.s3_bucket.s3_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${module.s3_bucket.s3_bucket_arn}/*"
      }
    ]
  })
}

resource "aws_s3_object" "default_profile" {
  bucket = module.s3_bucket.s3_bucket_id
  key    = "profile-pictures/default.png"
  source = "./assets/default.png"
}
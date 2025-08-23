# outputs.tf

# VPC
output "vpc_id" {
  description = "VPCのID"
  value       = aws_vpc.this.id
}

output "vpc_cidr_block" {
  description = "VPCのCIDRブロック"
  value       = aws_vpc.this.cidr_block
}

output "vpc_arn" {
  description = "VPCのARN"
  value       = aws_vpc.this.arn
}

# インターネットゲートウェイ
output "internet_gateway_id" {
  description = "インターネットゲートウェイのID"
  value       = aws_internet_gateway.this.id
}

# パブリックサブネット
output "public_subnet_ids" {
  description = "パブリックサブネットのID一覧"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック一覧"
  value       = [for subnet in aws_subnet.public : subnet.cidr_block]
}

output "public_subnet_arns" {
  description = "パブリックサブネットのARN一覧"
  value       = [for subnet in aws_subnet.public : subnet.arn]
}

# プライベートサブネット
output "private_subnet_ids" {
  description = "プライベートサブネットのID一覧"
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDRブロック一覧"
  value       = [for subnet in aws_subnet.private : subnet.cidr_block]
}

output "private_subnet_arns" {
  description = "プライベートサブネットのARN一覧"
  value       = [for subnet in aws_subnet.private : subnet.arn]
}

# データベースサブネット
output "database_subnet_ids" {
  description = "データベースサブネットのID一覧"
  value       = [for subnet in aws_subnet.database : subnet.id]
}

output "database_subnet_cidrs" {
  description = "データベースサブネットのCIDRブロック一覧"
  value       = [for subnet in aws_subnet.database : subnet.cidr_block]
}

output "database_subnet_group_name" {
  description = "RDS用サブネットグループ名（別途作成が必要）"
  value       = var.create_database_subnets ? "${var.project}-database-subnet-group" : null
}

# NATゲートウェイ
output "nat_gateway_ids" {
  description = "NATゲートウェイのID一覧"
  value       = var.enable_nat_gateway ? [for nat in aws_nat_gateway.this : nat.id] : []
}

output "nat_gateway_public_ips" {
  description = "NATゲートウェイのパブリックIP一覧"
  value       = var.enable_nat_gateway ? [for eip in aws_eip.nat : eip.public_ip] : []
}

# ルートテーブル
output "public_route_table_ids" {
  description = "パブリックルートテーブルのID"
  value       = length(aws_route_table.public) > 0 ? aws_route_table.public[0].id : null
}

output "private_route_table_ids" {
  description = "プライベートルートテーブルのID一覧"
  value       = [for rt in aws_route_table.private : rt.id]
}

output "database_route_table_ids" {
  description = "データベースルートテーブルのID"
  value       = length(aws_route_table.database) > 0 ? aws_route_table.database[0].id : null
}

# VPCエンドポイント
output "s3_vpc_endpoint_id" {
  description = "S3 VPCエンドポイントのID"
  value       = var.enable_s3_endpoint ? aws_vpc_endpoint.s3[0].id : null
}

output "api_gateway_vpc_endpoint_id" {
  description = "API Gateway VPCエンドポイントのID"
  value       = var.enable_api_gateway_endpoint ? aws_vpc_endpoint.api_gateway[0].id : null
}

output "lambda_vpc_endpoint_id" {
  description = "Lambda VPCエンドポイントのID"
  value       = var.enable_lambda_endpoint ? aws_vpc_endpoint.lambda[0].id : null
}

output "dynamodb_vpc_endpoint_id" {
  description = "DynamoDB VPCエンドポイントのID"
  value       = var.enable_dynamodb_endpoint ? aws_vpc_endpoint.dynamodb[0].id : null
}

# アベイラビリティーゾーン
output "availability_zones" {
  description = "使用中のアベイラビリティーゾーン一覧"
  value       = var.azs
}

# 設定情報
output "nat_gateway_configuration" {
  description = "NATゲートウェイの設定情報"
  value = {
    enabled            = var.enable_nat_gateway
    single_nat_gateway = var.single_nat_gateway
    count              = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 0
  }
}
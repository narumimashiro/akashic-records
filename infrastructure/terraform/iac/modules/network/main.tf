# VPCの作成
resource "aws_vpc" "this" {
  # VPC全体のCIDR範囲
  cidr_block           = var.vpc_cidr
  # VPC内でDNSを有効化
  ## ホスト名解決ができなくなるため基本はTrue
  enable_dns_support   = true
  # VPC内のリソースにDNSを付与
  enable_dns_hostnames = true
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-vpc"
    Tier = "network"
  })
}

# インターネットゲートウェイ（IGW）の作成
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-igw"
    Tier = "network"
  })
}

# パブリックサブネット（マルチAZ対応）
resource "aws_subnet" "public" {
  # VPCに複数のパブリックサブネットをマルチAZ（複数のAvailability Zone）で作成
  for_each = {
    for idx, az in var.azs : az => {
      az   = az
      cidr = var.public_cidrs[idx]
    }
  }
  
  vpc_id                  = aws_vpc.this.id
  availability_zone       = each.value.az
  cidr_block              = each.value.cidr
  map_public_ip_on_launch = var.map_public_ip_on_launch
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-public-${substr(each.value.az, -1, 1)}"
    Tier = "public"
    Type = "public-subnet"
  })
}

# プライベートサブネット（マルチAZ対応）
resource "aws_subnet" "private" {
  # VPCに複数のプライベートサブネットをマルチAZ（複数のAvailability Zone）で作成
  for_each = {
    for idx, az in var.azs : az => {
      az   = az
      cidr = var.private_cidrs[idx]
    }
  }
  
  vpc_id                  = aws_vpc.this.id
  availability_zone       = each.value.az
  cidr_block              = each.value.cidr
  map_public_ip_on_launch = false
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-private-${substr(each.value.az, -1, 1)}"
    Tier = "private"
    Type = "private-subnet"
  })
}

# データベースサブネット
resource "aws_subnet" "database" {
  # データベース用のサブネット作成
  for_each = var.create_database_subnets ? {
    for idx, az in var.azs : az => {
      az   = az
      cidr = var.database_cidrs[idx]
    }
  } : {}
  
  vpc_id                  = aws_vpc.this.id
  availability_zone       = each.value.az
  cidr_block              = each.value.cidr
  map_public_ip_on_launch = false
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-database-${substr(each.value.az, -1, 1)}"
    Tier = "database"
    Type = "database-subnet"
  })
}

# NATゲートウェイ用Elastic IP
resource "aws_eip" "nat" {
  for_each = var.enable_nat_gateway ? (
    var.single_nat_gateway ? { "single" = "single" } : aws_subnet.public
  ) : {}
  
  domain     = "vpc"
  depends_on = [aws_internet_gateway.this]
  
  tags = merge(local.common_tags, {
    Name = var.single_nat_gateway ? "${var.project}-nat-eip" : "${var.project}-nat-eip-${substr(keys(aws_subnet.public)[index(keys(aws_subnet.public), each.key)], -1, 1)}"
    Tier = "network"
  })
}

# NATゲートウェイ
resource "aws_nat_gateway" "this" {
  for_each = var.enable_nat_gateway ? (
    var.single_nat_gateway ? { 
      "single" = values(aws_subnet.public)[0].id 
    } : {
      for k, v in aws_subnet.public : k => v.id
    }
  ) : {}
  
  allocation_id = var.single_nat_gateway ? aws_eip.nat["single"].id : aws_eip.nat[each.key].id
  subnet_id     = var.single_nat_gateway ? values(aws_subnet.public)[0].id : each.value
  
  tags = merge(local.common_tags, {
    Name = var.single_nat_gateway ? "${var.project}-natgw" : "${var.project}-natgw-${substr(each.key, -1, 1)}"
    Tier = "network"
  })
  
  depends_on = [aws_internet_gateway.this]
}

# パブリックルートテーブル
resource "aws_route_table" "public" {
  count  = length(var.azs) > 0 ? 1 : 0
  vpc_id = aws_vpc.this.id
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-public-rt"
    Tier = "network"
    Type = "public-route-table"
  })
}

# パブリックルート（IGWへのルーティング）
resource "aws_route" "public_igw" {
  count                  = length(var.azs) > 0 ? 1 : 0
  route_table_id         = aws_route_table.public[0].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
  
  depends_on = [aws_route_table.public]
}

# プライベートルートテーブル
resource "aws_route_table" "private" {
  for_each = var.enable_nat_gateway ? (
    var.single_nat_gateway ? { "single" = "single" } : aws_subnet.private
  ) : aws_subnet.private
  
  vpc_id = aws_vpc.this.id
  
  tags = merge(local.common_tags, {
    Name = var.single_nat_gateway ? "${var.project}-private-rt" : "${var.project}-private-rt-${substr(each.key, -1, 1)}"
    Tier = "network"
    Type = "private-route-table"
  })
}

# プライベートルート（NATGWへのルーティング）
resource "aws_route" "private_nat" {
  for_each = var.enable_nat_gateway ? aws_route_table.private : {}
  
  route_table_id         = each.value.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id = var.single_nat_gateway ? (
    values(aws_nat_gateway.this)[0].id
  ) : (
    aws_nat_gateway.this[each.key].id
  )
  
  depends_on = [aws_route_table.private]
}

# データベースルートテーブル（オプション）
resource "aws_route_table" "database" {
  count  = var.create_database_subnets ? 1 : 0
  vpc_id = aws_vpc.this.id
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-database-rt"
    Tier = "database"
    Type = "database-route-table"
  })
}

# サブネットとルートテーブルの関連付け（パブリック）
resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public[0].id
}

# サブネットとルートテーブルの関連付け（プライベート）
resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private
  subnet_id      = each.value.id
  route_table_id = var.single_nat_gateway ? (
    aws_route_table.private["single"].id
  ) : (
    aws_route_table.private[each.key].id
  )
}

# サブネットとルートテーブルの関連付け（データベース）
resource "aws_route_table_association" "database" {
  for_each       = aws_subnet.database
  subnet_id      = each.value.id
  route_table_id = aws_route_table.database[0].id
}

# VPCフローログ（オプション）
resource "aws_flow_log" "vpc" {
  count           = var.enable_flow_log ? 1 : 0
  iam_role_arn    = var.flow_log_iam_role_arn
  log_destination = var.flow_log_destination
  traffic_type    = var.flow_log_traffic_type
  vpc_id          = aws_vpc.this.id
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-vpc-flow-log"
    Tier = "network"
  })
}

# VPCエンドポイント（API Gateway用）
resource "aws_vpc_endpoint" "api_gateway" {
  count               = var.enable_api_gateway_endpoint ? 1 : 0
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.execute-api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = values(aws_subnet.private)[*].id
  security_group_ids  = var.api_gateway_endpoint_security_group_ids
  private_dns_enabled = true
  
  policy = var.api_gateway_endpoint_policy
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-api-gateway-endpoint"
    Tier = "network"
  })
}

# VPCエンドポイント（Lambda用）- サーバーレスAPI構成時
resource "aws_vpc_endpoint" "lambda" {
  count               = var.enable_lambda_endpoint ? 1 : 0
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.lambda"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = values(aws_subnet.private)[*].id
  security_group_ids  = var.lambda_endpoint_security_group_ids
  private_dns_enabled = true
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-lambda-endpoint"
    Tier = "network"
  })
}

# VPCエンドポイント（S3用）- API用のファイル配信やログ保存で必要な場合
resource "aws_vpc_endpoint" "s3" {
  count        = var.enable_s3_endpoint ? 1 : 0
  vpc_id       = aws_vpc.this.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-s3-endpoint"
    Tier = "network"
  })
}

# VPCエンドポイント（DynamoDB用）- NoSQLデータベース使用時
resource "aws_vpc_endpoint" "dynamodb" {
  count        = var.enable_dynamodb_endpoint ? 1 : 0
  vpc_id       = aws_vpc.this.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  
  tags = merge(local.common_tags, {
    Name = "${var.project}-dynamodb-endpoint"
    Tier = "network"
  })
}

# VPCエンドポイントとルートテーブルの関連付け（Gateway型エンドポイント用）
resource "aws_vpc_endpoint_route_table_association" "s3_private" {
  count           = var.enable_s3_endpoint ? length(aws_route_table.private) : 0
  vpc_endpoint_id = aws_vpc_endpoint.s3[0].id
  route_table_id  = values(aws_route_table.private)[count.index].id
}

resource "aws_vpc_endpoint_route_table_association" "dynamodb_private" {
  count           = var.enable_dynamodb_endpoint ? length(aws_route_table.private) : 0
  vpc_endpoint_id = aws_vpc_endpoint.dynamodb[0].id
  route_table_id  = values(aws_route_table.private)[count.index].id
}

# データソース
data "aws_region" "current" {}

# ローカル変数
locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    Terraform   = "true"
  }
}
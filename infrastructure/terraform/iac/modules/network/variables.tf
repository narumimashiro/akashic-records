# variables.tf

variable "project" {
  description = "プロジェクト名"
  type        = string
  validation {
    condition     = length(var.project) > 0 && length(var.project) <= 20
    error_message = "プロジェクト名は1-20文字で指定してください。"
  }
}

variable "environment" {
  description = "環境名（dev, stg, prod等）"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "stg", "prod", "test"], var.environment)
    error_message = "環境名はdev, stg, prod, testのいずれかを指定してください。"
  }
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "有効なCIDRブロックを指定してください。"
  }
}

variable "azs" {
  description = "使用するアベイラビリティーゾーン"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
  validation {
    condition     = length(var.azs) >= 2
    error_message = "最低2つのアベイラビリティーゾーンを指定してください。"
  }
}

variable "public_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  validation {
    condition = length(var.public_cidrs) >= 2 && alltrue([
      for cidr in var.public_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "最低2つの有効なCIDRブロックを指定してください。"
  }
}

variable "private_cidrs" {
  description = "プライベートサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
  validation {
    condition = length(var.private_cidrs) >= 2 && alltrue([
      for cidr in var.private_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "最低2つの有効なCIDRブロックを指定してください。"
  }
}

variable "database_cidrs" {
  description = "データベースサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24"]
  validation {
    condition = length(var.database_cidrs) >= 2 && alltrue([
      for cidr in var.database_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "最低2つの有効なCIDRブロックを指定してください。"
  }
}

variable "create_database_subnets" {
  description = "データベースサブネットを作成するかどうか"
  type        = bool
  default     = true
}

variable "map_public_ip_on_launch" {
  description = "パブリックサブネットでインスタンス起動時に自動的にパブリックIPを割り当てるか"
  type        = bool
  default     = false
}

variable "enable_nat_gateway" {
  description = "NATゲートウェイを作成するかどうか"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "単一のNATゲートウェイを使用するか（コスト削減用）"
  type        = bool
  default     = true
}

variable "enable_flow_log" {
  description = "VPCフローログを有効にするかどうか"
  type        = bool
  default     = false
}

variable "flow_log_destination" {
  description = "フローログの出力先（CloudWatch Logs ARN）"
  type        = string
  default     = null
}

variable "flow_log_traffic_type" {
  description = "フローログのトラフィックタイプ"
  type        = string
  default     = "ALL"
  validation {
    condition     = contains(["ACCEPT", "REJECT", "ALL"], var.flow_log_traffic_type)
    error_message = "トラフィックタイプはACCEPT, REJECT, ALLのいずれかを指定してください。"
  }
}

variable "flow_log_iam_role_arn" {
  description = "フローログ用のIAMロールARN"
  type        = string
  default     = null
}

variable "enable_s3_endpoint" {
  description = "S3 VPCエンドポイントを作成するかどうか（APIのファイル操作やログ保存時に有効）"
  type        = bool
  default     = false  # CloudFront+S3構成では基本不要
}

variable "enable_api_gateway_endpoint" {
  description = "API Gateway VPCエンドポイントを作成するかどうか"
  type        = bool
  default     = false
}

variable "api_gateway_endpoint_security_group_ids" {
  description = "API Gateway VPCエンドポイント用のセキュリティグループID"
  type        = list(string)
  default     = []
}

variable "api_gateway_endpoint_policy" {
  description = "API Gateway VPCエンドポイントのポリシー（JSON文字列）"
  type        = string
  default     = null
}

variable "enable_lambda_endpoint" {
  description = "Lambda VPCエンドポイントを作成するかどうか（Lambda関数をVPC内で使用する場合）"
  type        = bool
  default     = false
}

variable "lambda_endpoint_security_group_ids" {
  description = "Lambda VPCエンドポイント用のセキュリティグループID"
  type        = list(string)
  default     = []
}

variable "enable_dynamodb_endpoint" {
  description = "DynamoDB VPCエンドポイントを作成するかどうか"
  type        = bool
  default     = false
}
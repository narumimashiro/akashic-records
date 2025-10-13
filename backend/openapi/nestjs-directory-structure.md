# NestjsのAPIファーストのAPI開発に向けて、ディレクトリ構成の調査

### 技術スタック

<a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/-NestJS-ea2845?logo=nestjs&logoColor=white" alt="NestJS" /></a>
<a href="https://www.openapis.org/" target="_blank"><img src="https://img.shields.io/badge/OpenAPI-6BA539?style=flat&logo=openapi-initiative&logoColor=white" alt="OpenAPI" /></a>

## ディレクトリ構成のベストプラクティスは

```text
project-root/
├── api/                        # OpenAPI仕様書を管理
│   ├── openapi.yaml             # メインのOpenAPI定義
│   └── schemas/                 # スキーマを分割管理
│       ├── user.yaml
│       ├── post.yaml
│       └── common.yaml
│
├── src/
│   ├── generated/              # 自動生成されたコード
│   │   ├── api/                 # APIクライアント・型定義
│   │   └── dto/                 # DTOクラス
│   │
│   ├── modules/                # 機能別モジュール
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── dto/
│   │   └── posts/
│   │       ├── posts.controller.ts
│   │       ├── posts.service.ts
│   │       └── posts.module.ts
│   │
│   ├── common/                 # 共通機能
│   │   ├── filters/             # 例外フィルター
│   │   ├── interceptors/        # インターセプター
│   │   ├── guards/              # ガード
│   │   └── decorators/          # カスタムデコレータ
│   │
│   ├── config/                 # 設定ファイル
│   │   └── configuration.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── scripts/                    # ビルド・生成スクリプト
│   └── generate-api.sh
│
├── package.json
├── nest-cli.json
└── tsconfig.json
```

### api - ディレクトリ

- OpenAPIの仕様書を一元管理する
- スキーマは分割管理し、メンテナンス性Up
  - Redoc等で配信する場合は`$ref`参照が効かないので事前のバンドルが必要
  
### src/generated - ディレクトリ

- 自動生成されたコードの配置
  - 自動生成のためGithub上での管理は不要
- ビルド時は毎回生成する運用とする

## 開発フロー

1. OpenAPI仕様を作成(openapi.yaml)
2. ジェネレーターでコード生成
3. 生成されたDTOや型を用いて、ControllerやServiceなどのアプリ側開発
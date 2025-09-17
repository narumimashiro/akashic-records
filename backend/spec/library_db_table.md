# 図書館貸し出しシステム テーブル設計

## 書籍マスタ (m_book)

| カラム名       | データ型     | NULL許可 | 制約  | デフォルト値 | 説明           |
| -------------- | ------------ | :------: | :---: | ------------ | -------------- |
| id             | BIGSERIAL    | NOT NULL |  PK   | -            | 書籍ID         |
| title          | VARCHAR(200) | NOT NULL |  UK   | -            | 書籍のタイトル |
| author         | VARCHAR(100) | NOT NULL |  UK   | -            | 書籍の著者     |
| genre          | SMALLINT     | NOT NULL |  FK   | -            | m_genre.id     |
| publication_at | DATE         |   YES    |   -   | -            | 出版年         |

## ジャンルマスタ (m_genre)

| カラム名 | データ型     | NULL許可 | 制約  | デフォルト値 | 説明         |
| -------- | ------------ | :------: | :---: | ------------ | ------------ |
| id       | SMALLSERIAL  | NOT NULL |  PK   | -            | ジャンルID   |
| name     | VARCHAR(100) | NOT NULL |  UK   | -            | ジャンル名称 |
| category | VARCHAR(100) | NOT NULL |  UK   | その他       | カテゴリー   |

## ユーザーマスタ (m_user)

| カラム名     | データ型     | NULL許可 | 制約  | デフォルト値 | 説明           |
| ------------ | ------------ | :------: | :---: | ------------ | -------------- |
| user_id      | BIGSERIAL    | NOT NULL |  PK   | -            | ユーザーID     |
| user_name    | VARCHAR(100) | NOT NULL |  UK   | -            | ユーザー名     |
| email        | VARCHAR(255) | NOT NULL |  UK   | -            | メールアドレス |
| phone_number | VARCHAR(20)  |   YES    |   -   | -            | 電話番号       |
| address      | VARCHAR(50)  |   YES    |   -   | -            | 住所           |

## 貸し出し履歴テーブル (t_rental_history)

| カラム名      | データ型  | NULL許可 | 制約  | デフォルト値 | 説明                 |
| ------------- | --------- | :------: | :---: | ------------ | -------------------- |
| id            | BIGSERIAL | NOT NULL |  PK   | -            | 貸し出し履歴ID       |
| user_id       | BIGINT    | NOT NULL |  FK   | -            | m_user.user_id       |
| book_id       | BIGINT    | NOT NULL |  FK   | -            | m_book.id            |
| checkout_date | TIMESTAMP | NOT NULL |   -   | -            | 貸し出し日時         |
| due_date      | DATE      | NOT NULL |   -   | -            | 返却期限             |
| return_date   | TIMESTAMP |   YES    |   -   | -            | 返却日時             |
| status        | ENUM      | NOT NULL |   -   | 0            | (0:貸出中, 1:返却済) |

## 図書館マスタ (m_library)

| カラム名      | データ型  | NULL許可 | 制約  | デフォルト値 | 説明                 |
| ------------- | --------- | :------: | :---: | ------------ | -------------------- |

## 在庫管理テーブル (t_mgt_inventory)

| カラム名      | データ型  | NULL許可 | 制約  | デフォルト値 | 説明                 |
| ------------- | --------- | :------: | :---: | ------------ | -------------------- |

## 共通項目

| カラム名   | データ型     | NULL許可 | 制約  | デフォルト値 | 説明             |
| ---------- | ------------ | :------: | :---: | ------------ | ---------------- |
| created_at | TIMESTAMP    | NOT NULL |   -   | -            | レコード作成日時 |
| created_by | VARCHAR(100) | NOT NULL |   -   | -            | レコード作成者   |
| updated_at | TIMESTAMP    | NOT NULL |   -   | -            | レコード更新日時 |
| updated_by | VARCHAR(100) | NOT NULL |   -   | -            | レコード更新者   |
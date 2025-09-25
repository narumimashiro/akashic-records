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

| カラム名     | データ型    | NULL許可 | 制約  | デフォルト値 | 説明                      |
| ------------ | ----------- | :------: | :---: | ------------ | ------------------------- |
| id           | BIGSERIAL   | NOT NULL |  PK   | -            | 図書館ID                  |
| name         | VARCHAR(20) | NOT NULL |  UK   | -            | 図書館名                  |
| closed_days  | VARCHAR(1)  |   YES    |   -   | -            | 定休日(0:日,1:月,...6:土) |
| opening_hour | TIMESTAMP   | NOT NULL |   -   | -            | 開館時間                  |
| closing_time | TIMESTAMP   | NOT NULL |   -   | -            | 閉館時間                  |

## 在庫管理テーブル (t_mgt_inventory)

| カラム名        | データ型  | NULL許可 | 制約  | デフォルト値 | 説明         |
| --------------- | --------- | :------: | :---: | ------------ | ------------ |
| id              | BIGSERIAL | NOT NULL |  PK   | -            | 在庫ID       |
| book_id         | BIGINT    | NOT NULL |  FK   | -            | m_book.id    |
| number_of_piece | SMALLINT  |    -     |   -   | -            | 部数         |
| library_id      | BIGINT    | NOT NULL |  FK   | -            | m_library.id |
| books_on_loan   | SMALLINT  | NOT NULL |   -   | -            | 貸出中の数   |

## 共通項目

| カラム名   | データ型     | NULL許可 | 制約  | デフォルト値 | 説明             |
| ---------- | ------------ | :------: | :---: | ------------ | ---------------- |
| created_at | TIMESTAMP    | NOT NULL |   -   | -            | レコード作成日時 |
| created_by | VARCHAR(100) | NOT NULL |   -   | -            | レコード作成者   |
| updated_at | TIMESTAMP    | NOT NULL |   -   | -            | レコード更新日時 |
| updated_by | VARCHAR(100) | NOT NULL |   -   | -            | レコード更新者   |
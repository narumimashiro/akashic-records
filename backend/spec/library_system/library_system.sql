-- 図書館貸し出しシステム DDL (PostgreSQL)

-- ジャンルマスタ
CREATE TABLE m_genre (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL DEFAULT 'その他',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    CONSTRAINT uk_m_genre_name_category UNIQUE (name, category)
);

-- 書籍マスタ
CREATE TABLE m_book (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre SMALLINT NOT NULL REFERENCES m_genre(id),
    publication_at DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    CONSTRAINT uk_m_book_title_author UNIQUE (title, author)
);

-- ユーザーマスタ
CREATE TABLE m_user (
    user_id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL
);

-- 図書館マスタ
CREATE TABLE m_library (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    closed_days VARCHAR(1),
    opening_hour TIME NOT NULL,
    closing_time TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL
);

-- 在庫管理テーブル
CREATE TABLE t_mgt_inventory (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES m_book(id),
    number_of_piece SMALLINT NOT NULL,
    library_id BIGINT NOT NULL REFERENCES m_library(id),
    books_on_loan SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL
);

-- 貸し出し履歴テーブル
CREATE TYPE rental_status AS ENUM ('0', '1');

CREATE TABLE t_rental_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES m_user(user_id),
    book_id BIGINT NOT NULL REFERENCES m_book(id),
    checkout_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    return_date TIMESTAMP,
    status rental_status NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL
);

-- インデックス作成
CREATE INDEX idx_t_rental_history_user_id ON t_rental_history(user_id);
CREATE INDEX idx_t_rental_history_book_id ON t_rental_history(book_id);
CREATE INDEX idx_t_rental_history_status ON t_rental_history(status);
CREATE INDEX idx_t_mgt_inventory_book_id ON t_mgt_inventory(book_id);
CREATE INDEX idx_t_mgt_inventory_library_id ON t_mgt_inventory(library_id);
-- V1__Initial_Schema.sql
-- Creates core tables for UPSC NewsHub AI

-- Enable pgvector extension (will be used later for embeddings)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(50)  NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    icon         VARCHAR(10),
    color        VARCHAR(20),
    sort_order   INTEGER      NOT NULL DEFAULT 0
);

-- Seed default UPSC categories
INSERT INTO categories (name, display_name, icon, color, sort_order) VALUES
    ('POLITY', 'Polity & Governance', '🏛️', '#6366f1', 1),
    ('ECONOMY', 'Economy', '💰', '#f59e0b', 2),
    ('ENVIRONMENT', 'Environment', '🌱', '#22c55e', 3),
    ('SCIENCE_TECH', 'Science & Technology', '🚀', '#3b82f6', 4),
    ('DEFENCE', 'Defence', '🛡️', '#ef4444', 5),
    ('GEOPOLITICS', 'Geopolitics', '🌍', '#8b5cf6', 6),
    ('INTERNATIONAL_RELATIONS', 'International Relations', '🤝', '#06b6d4', 7),
    ('HISTORY', 'History', '📜', '#a78bfa', 8),
    ('SOCIETY', 'Society', '👥', '#ec4899', 9),
    ('GOVERNANCE', 'Governance', '⚖️', '#14b8a6', 10),
    ('AGRICULTURE', 'Agriculture', '🌾', '#84cc16', 11),
    ('ETHICS', 'Ethics', '🧭', '#f97316', 12),
    ('CURRENT_AFFAIRS', 'Current Affairs', '📰', '#0ea5e9', 13);

-- =============================================
-- NEWS SOURCES
-- =============================================
CREATE TABLE news_sources (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     VARCHAR(200)  NOT NULL,
    source_type              VARCHAR(20)   NOT NULL,
    base_url                 VARCHAR(500),
    rss_url                  VARCHAR(500),
    api_url                  VARCHAR(500),
    telegram_channel_id      VARCHAR(100),
    telegram_channel_url     VARCHAR(500),
    authorized_distribution  BOOLEAN       NOT NULL DEFAULT FALSE,
    active                   BOOLEAN       NOT NULL DEFAULT TRUE,
    poll_interval_minutes    INTEGER       NOT NULL DEFAULT 60,
    last_fetched_at          TIMESTAMP,
    config                   JSONB,
    created_at               TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_sources_type ON news_sources(source_type);
CREATE INDEX idx_news_sources_active ON news_sources(active);

-- =============================================
-- ARTICLES
-- =============================================
CREATE TABLE articles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(500) NOT NULL,
    description   TEXT,
    content       TEXT,
    source_url    VARCHAR(1000) UNIQUE,
    source_name   VARCHAR(200),
    content_hash  VARCHAR(64),
    published_at  TIMESTAMP,
    image_url     VARCHAR(1000),
    author        VARCHAR(200),
    importance    VARCHAR(20) DEFAULT 'NORMAL',
    source_id     UUID REFERENCES news_sources(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_hash ON articles(content_hash);
CREATE INDEX idx_articles_importance ON articles(importance);

-- Full-text search index
ALTER TABLE articles ADD COLUMN search_vector tsvector;
CREATE INDEX idx_articles_fts ON articles USING GIN(search_vector);

-- =============================================
-- ARTICLE CATEGORIES (many-to-many)
-- =============================================
CREATE TABLE article_categories (
    article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

-- =============================================
-- NEWSPAPERS
-- =============================================
CREATE TABLE newspapers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(300) NOT NULL,
    edition_date      DATE         NOT NULL,
    language          VARCHAR(50)  NOT NULL DEFAULT 'English',
    source_id         UUID         REFERENCES news_sources(id),
    pdf_url           VARCHAR(1000),
    storage_path      VARCHAR(500),
    can_redistribute  BOOLEAN      NOT NULL DEFAULT FALSE,
    thumbnail_url     VARCHAR(1000),
    page_count        INTEGER,
    file_size         BIGINT,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newspapers_date ON newspapers(edition_date DESC);
CREATE INDEX idx_newspapers_source ON newspapers(source_id);
CREATE INDEX idx_newspapers_lang ON newspapers(language);

-- =============================================
-- BOOKMARKS
-- =============================================
CREATE TABLE bookmarks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    note       TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- =============================================
-- READING HISTORY
-- =============================================
CREATE TABLE reading_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id      UUID    NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    read_percentage INTEGER DEFAULT 0,
    read_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_reading_history_article ON reading_history(article_id);

-- =============================================
-- DOCUMENTS (user-uploaded PDFs)
-- =============================================
CREATE TABLE documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename          VARCHAR(255) NOT NULL,
    original_name     VARCHAR(255) NOT NULL,
    file_type         VARCHAR(20)  NOT NULL,
    source            VARCHAR(50)  DEFAULT 'UPLOAD',
    uploaded_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    newspaper_id      UUID         REFERENCES newspapers(id) ON DELETE SET NULL,
    extracted_text    TEXT,
    processing_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    page_count        INTEGER,
    file_size         BIGINT,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(processing_status);

-- =============================================
-- UPSC ANALYSES
-- =============================================
CREATE TABLE upsc_analyses (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id             UUID UNIQUE NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    syllabus_paper         VARCHAR(50),
    prelims_relevance      TEXT,
    mains_relevance        TEXT,
    key_facts              JSONB,
    background             TEXT,
    challenges             TEXT,
    government_initiatives TEXT,
    way_forward            TEXT,
    keywords               TEXT,
    generated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upsc_analyses_article ON upsc_analyses(article_id);

-- =============================================
-- GENERATED QUESTIONS
-- =============================================
CREATE TABLE generated_questions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id    UUID        REFERENCES upsc_analyses(id) ON DELETE CASCADE,
    article_id     UUID        REFERENCES articles(id) ON DELETE CASCADE,
    question_type  VARCHAR(20) NOT NULL,
    question       TEXT        NOT NULL,
    options        JSONB,
    correct_answer VARCHAR(10),
    explanation    TEXT,
    difficulty     VARCHAR(20) DEFAULT 'MEDIUM',
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gen_questions_type ON generated_questions(question_type);
CREATE INDEX idx_gen_questions_article ON generated_questions(article_id);

-- =============================================
-- SEARCH HISTORY
-- =============================================
CREATE TABLE search_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query        VARCHAR(500) NOT NULL,
    search_type  VARCHAR(20) DEFAULT 'TEXT',
    result_count INTEGER     DEFAULT 0,
    searched_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);

-- =============================================
-- USER PREFERENCES
-- =============================================
CREATE TABLE user_preferences (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interested_categories JSONB   DEFAULT '[]',
    preferred_language    VARCHAR(20) DEFAULT 'English',
    dark_mode             BOOLEAN DEFAULT FALSE,
    daily_brief_enabled   BOOLEAN DEFAULT TRUE,
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- INGESTION LOGS
-- =============================================
CREATE TABLE ingestion_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id          UUID REFERENCES news_sources(id) ON DELETE SET NULL,
    status             VARCHAR(20) NOT NULL,
    articles_fetched   INTEGER DEFAULT 0,
    articles_new       INTEGER DEFAULT 0,
    articles_duplicate INTEGER DEFAULT 0,
    error_message      TEXT,
    started_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at       TIMESTAMP
);

CREATE INDEX idx_ingestion_logs_source ON ingestion_logs(source_id);
CREATE INDEX idx_ingestion_logs_status ON ingestion_logs(status);

-- =============================================
-- REFRESH TOKENS
-- =============================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- =============================================
-- Trigger to auto-update search_vector on articles
-- =============================================
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.content, '') || ' ' ||
        COALESCE(NEW.author, '') || ' ' ||
        COALESCE(NEW.source_name, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_articles_search_vector
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_articles_search_vector();

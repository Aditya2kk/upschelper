-- Seed demo users for development
-- Password for both: Password123!
-- BCrypt hash generated via bcryptjs (cost factor 10)
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'UPSC Aspirant',
        'aspirant@upsc.gov.in',
        '$2a$10$0JoK84MtY.IgFR4dqwYj2.oHwTQeU6.6pamgh.efKc/wJfLWZaAa.',
        'USER',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'Admin User',
        'admin@upsc.gov.in',
        '$2a$10$0JoK84MtY.IgFR4dqwYj2.oHwTQeU6.6pamgh.efKc/wJfLWZaAa.',
        'ADMIN',
        NOW(),
        NOW()
    )
ON CONFLICT (email) DO NOTHING;

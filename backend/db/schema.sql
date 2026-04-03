CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE SKILL_TYPE AS ENUM (
    'language',
    'database',
    'framework_or_library',
    'cloud',
    'tool',
    'other'
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type SKILL_TYPE NOT NULL
);

CREATE TABLE account_skills (
    account_id INT REFERENCES accounts (id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills (id) ON DELETE CASCADE,
    PRIMARY KEY (account_id, skill_id)
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    creator_id INT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    group_name VARCHAR(100) NOT NULL,
    max_members INTEGER NOT NULL CHECK (max_members > 0),
    created_by INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    group_id INT REFERENCES groups (id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account_groups (
    account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    is_pending BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, group_id)
);

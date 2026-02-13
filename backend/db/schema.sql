
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE skill_type AS ENUM (
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
  type skill_type NOT NULL
);

CREATE TABLE account_skills (
  account_id INT REFERENCES accounts(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, skill_id)
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  creator_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  author_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  total_slots INT NOT NULL,
  filled_slots INT NOT NULL
);

CREATE TABLE groups (
    group_id        SERIAL PRIMARY KEY,
    class_id        INTEGER NOT NULL,
    group_name      VARCHAR(100) NOT NULL,
    max_members     INTEGER NOT NULL CHECK (max_members > 0),
    created_by      INTEGER NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_groups_class
        FOREIGN KEY (class_id)
        REFERENCES classes(class_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_groups_created_by
        FOREIGN KEY (created_by)
        REFERENCES accounts(account_id)
        ON DELETE CASCADE
);

CREATE TABLE account_groups (
    account_id      INTEGER NOT NULL,
    group_id        INTEGER NOT NULL,
    joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (account_id, group_id),

    CONSTRAINT fk_account_groups_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(account_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_account_groups_group
        FOREIGN KEY (group_id)
        REFERENCES groups(group_id)
        ON DELETE CASCADE
);




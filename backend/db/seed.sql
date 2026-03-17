INSERT INTO accounts (email, password_hash, name)
VALUES
  ('jeremy@example.com', 'Hash1', 'jeremy'),
  ('alice@gmail.com', 'Hash2', 'alice'),
  ('bob@icloud.com', 'Hash3', 'bob'),
  ('carol@example.com', 'Hash4', 'carol'),
  ('dave@example.com', 'Hash5', 'dave'),
  ('eve@example.com', 'Hash6', 'eve'),
  ('frank@example.com', 'Hash7', 'frank');

INSERT INTO skills (name, type) VALUES
-- language
('python', 'language'),
('java', 'language'),
('c', 'language'),
('c++', 'language'),
('c#', 'language'),
('javascript', 'language'),
('typescript', 'language'),
('go', 'language'),
('rust', 'language'),
('php', 'language'),
('ruby', 'language'),
('swift', 'language'),
('kotlin', 'language'),

-- framework_or_library
('react', 'framework_or_library'),
('next.js', 'framework_or_library'),
('vue', 'framework_or_library'),
('angular', 'framework_or_library'),
('express', 'framework_or_library'),
('nestjs', 'framework_or_library'),
('django', 'framework_or_library'),
('flask', 'framework_or_library'),
('spring', 'framework_or_library'),

-- database
('postgresql', 'database'),
('mysql', 'database'),
('sqlite', 'database'),
('mongodb', 'database'),
('redis', 'database'),

-- cloud
('aws', 'cloud'),
('gcp', 'cloud'),
('azure', 'cloud'),
('firebase', 'cloud'),

-- tools
('docker', 'tool'),
('kubernetes', 'tool'),
('terraform', 'tool'),
('git', 'tool'),
('bash', 'tool'),
('vim', 'tool'),
('vscode', 'tool'),
('postman', 'tool');

INSERT INTO account_skills (account_id, skill_id) VALUES
  (1, 1),  -- jeremy: python
  (1, 6),  -- jeremy: javascript
  (1, 14), -- jeremy: react
  (2, 2),  -- alice: java
  (2, 32), -- alice: spring
  (3, 7),  -- bob: typescript
  (3, 18), -- bob: nestjs
  (4, 1),  -- carol: python
  (4, 19), -- carol: django
  (5, 8),  -- dave: go
  (6, 6),  -- eve: javascript
  (6, 15), -- eve: next.js
  (7, 9);  -- frank: rust

INSERT INTO classes (name, section, creator_id) VALUES
  ('Database Systems', '001', 1),
  ('Web Development', '002', 2),
  ('Algorithms', '001', 3),
  ('Operating Systems', '003', 1),
  ('Software Engineering', '002', 4);

INSERT INTO posts (class_id, author_id, title, description) VALUES
  (1, 1, 'Looking for DB project partners', 'Need 2 people for the final project'),
  (1, 2, 'Study group for midterm', 'Reviewing indexing and transactions'),
  (2, 3, 'React frontend partner needed', 'Building a full stack app'),
  (3, 4, 'Algorithm study group', 'Covering dynamic programming this week'),
  (4, 5, 'OS project group', 'Working on the scheduler project'),
  (5, 2, 'SE team forming', 'Looking for members for agile project');

INSERT INTO groups (class_id, group_name, max_members, created_by) VALUES
  (1, 'DB Heroes', 4, 1),
  (2, 'Web Wizards', 3, 2),
  (3, 'Algo Squad', 5, 3),
  (4, 'Kernel Panic', 4, 4),
  (5, 'Agile Avengers', 4, 5);

INSERT INTO account_groups (account_id, group_id) VALUES
  (1, 1),
  (2, 1),
  (3, 2),
  (4, 2),
  (5, 3),
  (6, 3),
  (7, 4),
  (1, 5),
  (2, 5);


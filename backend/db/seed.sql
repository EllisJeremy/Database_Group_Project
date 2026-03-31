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
('Database Systems', '001', 1),   -- id 1, jeremy
('Web Development', '002', 2),    -- id 2, alice
('Algorithms', '001', 3),         -- id 3, bob
('Operating Systems', '003', 1),  -- id 4, jeremy
('Software Engineering', '002', 4); -- id 5, carol

-- Groups created by the same person who posts the ad
INSERT INTO groups (class_id, group_name, max_members, created_by) VALUES
(1, 'DB Heroes', 4, 1),         -- id 1, jeremy, class 1
(1, 'DB Study Group', 3, 2),    -- id 2, alice, class 1
(2, 'Web Wizards', 3, 3),       -- id 3, bob, class 2
(3, 'Algo Squad', 5, 4),        -- id 4, carol, class 3
(4, 'Kernel Panic', 4, 5),      -- id 5, dave, class 4
(5, 'Agile Avengers', 4, 2);    -- id 6, alice, class 5

-- Posts linked to their group (post is the group's ad)
INSERT INTO posts (class_id, author_id, group_id, title, description) VALUES
(1, 1, 1, 'Looking for DB project partners', 'Need 2 more people for the final project. We are using PostgreSQL and Python.'),
(1, 2, 2, 'Study group for midterm', 'Reviewing indexing and transactions. Open to all levels.'),
(2, 3, 3, 'React frontend partner needed', 'Building a full stack app with React and Express. Need 2 more.'),
(3, 4, 4, 'Algorithm study group', 'Covering dynamic programming and graph algorithms this week.'),
(4, 5, 5, 'OS project group', 'Working on the scheduler project. Looking for systems programmers.'),
(5, 2, 6, 'SE team forming', 'Looking for members for agile project. Experience with Git and Scrum a plus.');

-- Group members (creator auto-joined + others who joined)
INSERT INTO account_groups (account_id, group_id) VALUES
(1, 1), -- jeremy in DB Heroes (creator)
(3, 1), -- bob in DB Heroes
(2, 2), -- alice in DB Study Group (creator)
(4, 2), -- carol in DB Study Group
(3, 3), -- bob in Web Wizards (creator)
(6, 3), -- eve in Web Wizards
(4, 4), -- carol in Algo Squad (creator)
(5, 4), -- dave in Algo Squad
(5, 5), -- dave in Kernel Panic (creator)
(7, 5), -- frank in Kernel Panic
(2, 6), -- alice in Agile Avengers (creator)
(1, 6), -- jeremy in Agile Avengers
(3, 6); -- bob in Agile Avengers

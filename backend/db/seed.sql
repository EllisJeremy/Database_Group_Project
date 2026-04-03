INSERT INTO accounts (email, password_hash, name)
VALUES
(
    'jeremy@example.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'jeremy'
),
(
    'alice@gmail.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'alice'
),
(
    'bob@icloud.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'bob'
),
(
    'carol@example.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'carol'
),
(
    'dave@example.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'dave'
),
(
    'eve@example.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'eve'
),
(
    'frank@example.com',
    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC',
    'frank'
);

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

INSERT INTO groups (class_id, group_name, max_members, created_by) VALUES
(1, 'DB Heroes', 4, 1),
(1, 'DB Study Group', 3, 2),
(2, 'Web Wizards', 3, 3),
(3, 'Algo Squad', 5, 4),
(4, 'Kernel Panic', 4, 5),
(5, 'Agile Avengers', 4, 2);

INSERT INTO posts (class_id, author_id, group_id, title, description) VALUES
(
    1,
    1,
    1,
    'Looking for DB project partners',
    'Need 2 more people for the final project. We are using PostgreSQL and Python.'
),
(
    1,
    2,
    2,
    'Study group for midterm',
    'Reviewing indexing and transactions. Open to all levels.'
),
(
    2,
    3,
    3,
    'React frontend partner needed',
    'Building a full stack app with React and Express. Need 2 more.'
),
(
    3,
    4,
    4,
    'Algorithm study group',
    'Covering dynamic programming and graph algorithms this week.'
),
(
    4,
    5,
    5,
    'OS project group',
    'Working on the scheduler project. Looking for systems programmers.'
),
(
    5,
    2,
    6,
    'SE team forming',
    'Looking for members for agile project. Experience with Git and Scrum a plus.'
);

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

-- Web Development skill-match demo
-- Overlap relative to account id=1 (python, javascript, react)

INSERT INTO accounts (email, password_hash, name) VALUES
-- id 8: shares python+javascript+react (high match)
('sarah@example.com', 'Hash8', 'sarah'),
-- id 9: shares javascript+react (high match)
('mike@example.com', 'Hash9', 'mike'),
-- id 10: shares typescript only (low match)
('tom@example.com', 'Hash10', 'tom'),
-- id 11: shares python only (low match)
('lisa@example.com', 'Hash11', 'lisa'),
-- id 12: no shared skills (no match)
('chen@example.com', 'Hash12', 'chen'),
-- id 13: no shared skills (no match)
('priya@example.com', 'Hash13', 'priya');

INSERT INTO account_skills (account_id, skill_id) VALUES
-- sarah: python(1), javascript(6), react(14), typescript(7)
(8, 1),
(8, 6),
(8, 14),
(8, 7),
-- mike: javascript(6), react(14), next.js(15)
(9, 6),
(9, 14),
(9, 15),
-- tom: typescript(7), express(18), vue(16)
(10, 7),
(10, 18),
(10, 16),
-- lisa: python(1), django(20), postgresql(23)
(11, 1),
(11, 20),
(11, 23),
-- chen: java(2), spring(22), mysql(24)
(12, 2),
(12, 22),
(12, 24),
-- priya: go(8), rust(9), docker(31)
(13, 8),
(13, 9),
(13, 31);

-- id 7: high match, id 8: low match, id 9: no match
INSERT INTO groups (class_id, group_name, max_members, created_by) VALUES
(2, 'JS React Team', 4, 8),
(2, 'Full Stack Crew', 4, 10),
(2, 'Backend Masters', 4, 12);

INSERT INTO posts (class_id, author_id, group_id, title, description) VALUES
(
    2,
    8,
    7,
    'React + Node app — need 2 more!',
    'Full-stack with React and Node. Big on JS and TypeScript.'
),
(
    2,
    10,
    8,
    'Full stack team forming',
    'TypeScript frontend, Python backend. Need versatile devs.'
),
(
    2,
    12,
    9,
    'Java Spring Boot backend group',
    'Enterprise backend with Java, Spring, and MySQL.'
);

INSERT INTO account_groups (account_id, group_id) VALUES
(8, 7),
(9, 7),
(10, 8),
(11, 8),
(12, 9),
(13, 9);

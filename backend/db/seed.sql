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

INSERT INTO account_groups (account_id, group_id, is_pending) VALUES
(1, 1, false), -- jeremy in DB Heroes (creator)
(3, 1, false), -- bob in DB Heroes
(2, 2, false), -- alice in DB Study Group (creator)
(4, 2, false), -- carol in DB Study Group
(3, 3, false), -- bob in Web Wizards (creator)
(6, 3, false), -- eve in Web Wizards
(4, 4, false), -- carol in Algo Squad (creator)
(5, 4, false), -- dave in Algo Squad
(5, 5, false), -- dave in Kernel Panic (creator)
(7, 5, false), -- frank in Kernel Panic
(2, 6, false), -- alice in Agile Avengers (creator)
(1, 6, false), -- jeremy in Agile Avengers
(3, 6, false); -- bob in Agile Avengers

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

INSERT INTO account_groups (account_id, group_id, is_pending) VALUES
(8, 7, false),
(9, 7, false),
(10, 8, false),
(11, 8, false),
(12, 9, false),
(13, 9, false);

-- Expand each table to 20 tuples

-- accounts: add 7 more (IDs 14-20)
INSERT INTO accounts (email, password_hash, name) VALUES
('nina@example.com',   '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'nina'),
('oscar@example.com',  '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'oscar'),
('pam@example.com',    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'pam'),
('quinn@example.com',  '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'quinn'),
('rachel@example.com', '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'rachel'),
('sam@example.com',    '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'sam'),
('tina@example.com',   '$2b$10$focWf..Yp0/W9nI/dE.HYeNr3Q5l9tfuNqVfzfeRDZQdO5fe48BjC', 'tina');

-- classes: add 15 more (IDs 6-20)
INSERT INTO classes (name, section, creator_id) VALUES
('Machine Learning',             '001', 2),
('Computer Networks',            '002', 3),
('Cybersecurity',                '001', 4),
('Data Structures',              '003', 5),
('Cloud Computing',              '001', 6),
('Mobile Development',           '002', 7),
('Artificial Intelligence',      '001', 8),
('Human-Computer Interaction',   '002', 9),
('Computer Architecture',        '001', 10),
('Distributed Systems',          '003', 11),
('Game Development',             '002', 12),
('DevOps',                       '001', 13),
('Embedded Systems',             '002', 14),
('Parallel Computing',           '001', 15),
('Natural Language Processing',  '003', 16);

-- groups: add 11 more (IDs 10-20)
INSERT INTO groups (class_id, group_name, max_members, created_by) VALUES
(6,  'ML Pioneers',          4, 2),
(7,  'Network Ninjas',       3, 3),
(8,  'Cyber Defenders',      4, 4),
(9,  'Data Structures Club', 5, 5),
(10, 'Cloud Climbers',       4, 6),
(11, 'App Builders',         3, 7),
(12, 'AI Explorers',         5, 8),
(13, 'UX Team',              4, 9),
(14, 'Arch Angels',          4, 10),
(15, 'Dist Devs',            5, 11),
(16, 'Game Gurus',           4, 12);

-- posts: add 11 more (IDs 10-20)
INSERT INTO posts (class_id, author_id, group_id, title, description) VALUES
(6,  2,  10, 'ML group forming',               'Looking for partners for the ML project. Using scikit-learn and TensorFlow.'),
(7,  3,  11, 'Networks lab partners needed',   'Working on packet analysis. Need 2 more members with networking experience.'),
(8,  4,  12, 'Cybersecurity CTF team',         'Forming a CTF team for the semester finale. All skill levels welcome.'),
(9,  5,  13, 'Data Structures study group',    'Weekly sessions on trees, heaps, and graphs. Come with questions.'),
(10, 6,  14, 'Cloud project team forming',     'AWS-based project. Looking for people with cloud or backend experience.'),
(11, 7,  15, 'Mobile app dev partners',        'Building a React Native app. Need 2 more devs familiar with JS.'),
(12, 8,  16, 'AI research group',              'NLP and computer vision focus. Python and PyTorch experience preferred.'),
(13, 9,  17, 'HCI design team',               'User research and prototyping project. Designers and devs both welcome.'),
(14, 10, 18, 'Computer Arch project group',    'Cache design and CPU pipeline project. Low-level programming a must.'),
(15, 11, 19, 'Distributed systems group',      'Building a distributed key-value store. Go or Rust preferred.'),
(16, 12, 20, 'Game dev team forming',          'Unity game project. Looking for both programmers and designers.');

-- account_groups: add 1 more (reaches 20)
INSERT INTO account_groups (account_id, group_id, is_pending) VALUES
(14, 10, false);

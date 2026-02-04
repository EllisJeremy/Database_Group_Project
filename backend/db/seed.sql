INSERT INTO accounts (email, password_hash, name)
VALUES
  ('jeremy@example.com', 'Hash1', 'jeremy'),
  ('alice@gmail.com', 'Hash2', 'alice'),
  ('bob@icloud.com', 'Hash3', 'bob');

INSERT INTO skills (name, type) VALUES
-- Languages
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


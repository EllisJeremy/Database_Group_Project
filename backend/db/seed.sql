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

-- framework or library
('react', 'framework or library'),
('next.js', 'framework or library'),
('vue', 'framework or library'),
('angular', 'framework or library'),
('express', 'framework or library'),
('nestjs', 'framework or library'),
('django', 'framework or library'),
('flask', 'framework or library'),
('spring', 'framework or library'),

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


BEGIN;

INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', 4.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'rain' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'rain' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'rain' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'rain' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 4.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'rain' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', 2.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'usds' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'usds' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'usds' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'usds' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 2.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'usds' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', -0.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'leo' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'leo' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'leo' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'leo' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 0, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'leo' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', -1.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'xlm' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'xlm' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'xlm' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'xlm' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 0, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'xlm' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', 3.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'figr_heloc' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'figr_heloc' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'figr_heloc' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'figr_heloc' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 3.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'figr_heloc' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'promise_gap', 1.5, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'wbt' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'promise_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'build_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'wbt' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'build_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'hype_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'wbt' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'hype_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'belief_gap', NULL, NULL, 'unavailable', 'Not computed in the 2026-09-20 snapshot.'
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'wbt' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'belief_gap');
INSERT INTO score_snapshots (id, project_id, methodology_version_id, snapshot_date, score_code, value, confidence, status, unavailable_reason)
SELECT gen_random_uuid(), p.id, v.id, '2026-09-20', 'potential_outlook', 0.6, NULL, 'provisional', NULL
FROM projects p CROSS JOIN methodology_versions v
WHERE p.slug = 'wbt' AND v.version = '0.3.0'
AND NOT EXISTS (SELECT 1 FROM score_snapshots s WHERE s.project_id = p.id AND s.methodology_version_id = v.id AND s.snapshot_date = '2026-09-20' AND s.score_code = 'potential_outlook');

COMMIT;

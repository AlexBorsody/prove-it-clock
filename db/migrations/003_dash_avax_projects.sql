-- 003: durable registration of DASH and AVAX in public.projects.
-- These rows were first inserted live on 2026-09-25 (Phase 1 expansion);
-- this migration makes them reproducible on a rebuilt database. Idempotent:
-- inserts only when the slug is absent, and never touches existing rows.

INSERT INTO projects (id, slug, name, symbol, coingecko_id, defillama_slug, thesis_category_id, launch_date, launch_notes, status)
SELECT '64a21092-d6ef-4c8e-a60e-9a5368f0a434', 'dash', 'Dash', 'DASH', 'dash', NULL, '79a43c1f-d952-579c-90c5-8c4a346a13a1', '2014-01-18', 'XCoin launch 2014-01-18; became Darkcoin, then Dash.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'dash');

INSERT INTO projects (id, slug, name, symbol, coingecko_id, defillama_slug, thesis_category_id, launch_date, launch_notes, status)
SELECT '046dbc72-e97e-46de-9324-f18d43264ffb', 'avax', 'Avalanche', 'AVAX', 'avalanche-2', 'Avalanche', '8ac63e2e-b79c-592a-bde2-886c1543cdbd', '2020-09-21', 'Mainnet launch 2020-09-21.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'avax');

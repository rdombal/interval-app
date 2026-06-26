-- ============================================================
-- Seed: curated public library workouts (owner_id = null, is_public = true)
-- Run AFTER schema.sql. Re-runnable: clears prior library rows first.
-- ============================================================
delete from workout_blocks where workout_id in (select id from workouts where owner_id is null);
delete from workouts where owner_id is null;

-- 1) Classic Tabata
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('Classic Tabata', 'Eight all-out rounds of 20s on, 10s off. Short, brutal, effective.',
          'hiit', 'conditioning', 'max', 'intermediate', 'anywhere', '{}',
          '{vo2max,fat_loss,conditioning}', '{tabata,quick,bodyweight}', 'Library', true)
  returning id
), g as (select gen_random_uuid() as grp)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur,
       case when p.grouped then g.grp else null end, p.rounds
from w, g, (values
  (0,'warmup','Warm up',         120, false, 1),
  (1,'work',  'All-out effort',   20, true,  8),
  (2,'rest',  'Rest',             10, true,  8),
  (3,'cooldown','Cool down',     120, false, 1)
) as p(position,type,name,dur,grouped,rounds);

-- 2) 30/30 VO2max Intervals
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('30/30 VO2max', 'Ten rounds of 30s hard / 30s easy. A staple for aerobic power.',
          'running', 'vo2max', 'high', 'intermediate', 'outdoor', '{}',
          '{vo2max,endurance,speed}', '{running,intervals}', 'Library', true)
  returning id
), g as (select gen_random_uuid() as grp)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur,
       case when p.grouped then g.grp else null end, p.rounds
from w, g, (values
  (0,'warmup','Easy jog',       300, false, 1),
  (1,'work',  'Hard',            30, true, 10),
  (2,'rest',  'Easy',            30, true, 10),
  (3,'cooldown','Easy jog',     300, false, 1)
) as p(position,type,name,dur,grouped,rounds);

-- 3) Beginner Run/Walk
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('Beginner Run/Walk', 'Build your base: 60s run, 90s walk, repeated six times.',
          'running', 'endurance', 'low', 'beginner', 'outdoor', '{}',
          '{endurance,recovery}', '{running,beginner,base}', 'Library', true)
  returning id
), g as (select gen_random_uuid() as grp)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur,
       case when p.grouped then g.grp else null end, p.rounds
from w, g, (values
  (0,'warmup','Brisk walk',     180, false, 1),
  (1,'work',  'Run',             60, true,  6),
  (2,'rest',  'Walk',            90, true,  6),
  (3,'cooldown','Easy walk',    180, false, 1)
) as p(position,type,name,dur,grouped,rounds);

-- 4) Core Burnout
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('Core Burnout', 'Five rounds of 40s work, 20s rest. No equipment, all core.',
          'strength', 'conditioning', 'moderate', 'beginner', 'home', '{mat}',
          '{conditioning,fat_loss}', '{core,bodyweight,home}', 'Library', true)
  returning id
), g as (select gen_random_uuid() as grp)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur,
       case when p.grouped then g.grp else null end, p.rounds
from w, g, (values
  (0,'warmup','Mobility',         90, false, 1),
  (1,'work',  'Work',             40, true,  5),
  (2,'rest',  'Rest',             20, true,  5),
  (3,'cooldown','Stretch',       120, false, 1)
) as p(position,type,name,dur,grouped,rounds);

-- 5) Bike Sprint Pyramid
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('Bike Sprint Pyramid', 'Climbing sprints 15-30-45-30-15s with equal easy spinning between.',
          'cycling', 'speed', 'high', 'advanced', 'gym', '{bike}',
          '{speed,vo2max,conditioning}', '{cycling,pyramid,sprints}', 'Library', true)
  returning id
)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur, null, 1
from w, (values
  (0,'warmup','Spin up',     300),
  (1,'work',  'Sprint',       15),(2,'rest','Spin',45),
  (3,'work',  'Sprint',       30),(4,'rest','Spin',45),
  (5,'work',  'Sprint',       45),(6,'rest','Spin',45),
  (7,'work',  'Sprint',       30),(8,'rest','Spin',45),
  (9,'work',  'Sprint',       15),(10,'rest','Spin',45),
  (11,'cooldown','Easy spin',300)
) as p(position,type,name,dur);

-- 6) Recovery Flow
with w as (
  insert into workouts (name, description, sport, goal, intensity, level, location, equipment, training_effects, tags, coach, is_public)
  values ('Recovery Flow', 'Gentle 12-minute mobility flow to loosen up on rest days.',
          'mobility', 'recovery', 'low', 'beginner', 'home', '{mat}',
          '{recovery}', '{mobility,recovery,calm}', 'Library', true)
  returning id
), g as (select gen_random_uuid() as grp)
insert into workout_blocks (workout_id, position, type, name, duration_seconds, round_group, rounds)
select w.id, p.position, p.type::phase_type, p.name, p.dur,
       case when p.grouped then g.grp else null end, p.rounds
from w, g, (values
  (0,'warmup','Breathe',         60, false, 1),
  (1,'recovery','Hold & flow',   90, true,  6),
  (2,'rest',  'Transition',      30, true,  6),
  (3,'cooldown','Stillness',     60, false, 1)
) as p(position,type,name,dur,grouped,rounds);

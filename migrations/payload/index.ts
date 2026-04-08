import * as migration_20260405_000000 from './20260405_000000';
import * as migration_20260405_000001 from './20260405_000001';
import * as migration_20260406_000000 from './20260406_000000';
import * as migration_20260406_000001 from './20260406_000001';
import * as migration_20260406_000002 from './20260406_000002';
import * as migration_20260406_000003 from './20260406_000003';
import * as migration_20260407_000000 from './20260407_000000';
import * as migration_20260408_075601 from './20260408_075601';
import * as migration_20260408_193202_org_feed_section from './20260408_193202_org_feed_section';

export const migrations = [
  {
    up: migration_20260405_000000.up,
    down: migration_20260405_000000.down,
    name: '20260405_000000',
  },
  {
    up: migration_20260405_000001.up,
    down: migration_20260405_000001.down,
    name: '20260405_000001',
  },
  {
    up: migration_20260406_000000.up,
    down: migration_20260406_000000.down,
    name: '20260406_000000',
  },
  {
    up: migration_20260406_000001.up,
    down: migration_20260406_000001.down,
    name: '20260406_000001',
  },
  {
    up: migration_20260406_000002.up,
    down: migration_20260406_000002.down,
    name: '20260406_000002',
  },
  {
    up: migration_20260406_000003.up,
    down: migration_20260406_000003.down,
    name: '20260406_000003',
  },
  {
    up: migration_20260407_000000.up,
    down: migration_20260407_000000.down,
    name: '20260407_000000',
  },
  {
    up: migration_20260408_075601.up,
    down: migration_20260408_075601.down,
    name: '20260408_075601',
  },
  {
    up: migration_20260408_193202_org_feed_section.up,
    down: migration_20260408_193202_org_feed_section.down,
    name: '20260408_193202_org_feed_section'
  },
];

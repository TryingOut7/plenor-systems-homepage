import * as migration_20260405_000000 from './20260405_000000';
import * as migration_20260405_000001 from './20260405_000001';
import * as migration_20260406_000000 from './20260406_000000';
import * as migration_20260406_000001 from './20260406_000001';
import * as migration_20260406_000002 from './20260406_000002';
import * as migration_20260406_171118_final_sync_pre_deploy from './20260406_171118_final_sync_pre_deploy';

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
    up: migration_20260406_171118_final_sync_pre_deploy.up,
    down: migration_20260406_171118_final_sync_pre_deploy.down,
    name: '20260406_171118_final_sync_pre_deploy'
  },
];

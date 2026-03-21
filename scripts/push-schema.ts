import { getPayload } from 'payload';
import config from '../src/payload.config';

async function main() {
  console.log('Initializing Payload to push schema...');
  const payload = await getPayload({ config });
  console.log('Schema push complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});

import { pageSectionBlocks } from '../src/payload/blocks/pageSections.ts';
import { buildCorePresetSections } from '../src/payload/presets/corePagePresets.ts';
import { SYSTEM_FIELD_PATHS } from '../src/payload/systemFieldInventory.ts';

const STRUCTURAL_KEY_PATTERN = /^[a-z][a-z0-9-]{2,63}$/;

function ensure(condition, message, failures) {
  if (!condition) failures.push(message);
}

function checkSystemFieldInventory(failures) {
  const paths = [...SYSTEM_FIELD_PATHS];
  const seen = new Set();

  for (const path of paths) {
    ensure(path.includes('.'), `system field path must include collection prefix: ${path}`, failures);
    ensure(!seen.has(path), `duplicate system field path: ${path}`, failures);
    seen.add(path);
  }
}

function checkSectionBlockStructuralKeyCoverage(failures) {
  for (const block of pageSectionBlocks) {
    const fields = Array.isArray(block.fields) ? block.fields : [];
    const hasStructuralKey = fields.some((field) => field && typeof field === 'object' && field.name === 'structuralKey');
    ensure(hasStructuralKey, `block "${block.slug}" is missing structuralKey field`, failures);
  }
}

function checkCorePresetStructuralKeyRules(failures) {
  const presets = ['home', 'services', 'about', 'pricing', 'contact'];

  for (const preset of presets) {
    const sections = buildCorePresetSections(preset, {});
    const seen = new Set();

    for (const section of sections) {
      const record = section && typeof section === 'object' ? section : {};
      const blockType = typeof record.blockType === 'string' ? record.blockType : '';
      const key = typeof record.structuralKey === 'string' ? record.structuralKey : '';

      ensure(Boolean(key), `${preset}: section is missing structuralKey`, failures);
      ensure(STRUCTURAL_KEY_PATTERN.test(key), `${preset}: structuralKey has invalid format (${key})`, failures);
      ensure(!seen.has(key), `${preset}: duplicate structuralKey (${key})`, failures);
      ensure(!blockType.startsWith('legacy'), `${preset}: legacy block type found (${blockType})`, failures);

      seen.add(key);
    }
  }
}

function run() {
  const failures = [];

  checkSystemFieldInventory(failures);
  checkSectionBlockStructuralKeyCoverage(failures);
  checkCorePresetStructuralKeyRules(failures);

  if (failures.length > 0) {
    console.error('CMS schema governance check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('CMS schema governance check passed.');
}

run();

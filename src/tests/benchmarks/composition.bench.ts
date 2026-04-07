import { bench, describe } from 'vitest';
import { createCompositionProcessor } from '../../composition/index.js';
import { resolveTone } from '../../composition/tone-resolver.js';
import { resolveNasal } from '../../composition/nasal-resolver.js';
import { mapLetter } from '../../composition/letter-mapper.js';
import { createCompositionStateMachine } from '../../composition/state-machine.js';
import {
  desktopResolvedLayout,
  buildCompositionMap,
  acuteToneRules,
  nasalRules,
} from '../fixtures/index.js';
import { createKeyId } from '../../public/index.js';

const toneMap = buildCompositionMap(acuteToneRules());
const nasalMap = buildCompositionMap(nasalRules());

describe('Composition Benchmarks', () => {
  bench('resolveTone — single lookup', () => {
    resolveTone('´', 'a', toneMap);
  });

  bench('resolveNasal — single lookup', () => {
    resolveNasal('~', 'a', nasalMap);
  });

  bench('mapLetter — tone delegation', () => {
    mapLetter('´', 'e', 'tone', toneMap);
  });

  bench('mapLetter — nasal delegation', () => {
    mapLetter('~', 'o', 'nasal', nasalMap);
  });

  bench('mapLetter — miss (no matching base)', () => {
    mapLetter('´', 'z', 'tone', toneMap);
  });

  bench('state machine — arm + resolve cycle', () => {
    const sm = createCompositionStateMachine();
    sm.arm('´', 'tone-armed');
    sm.resolve();
  });

  bench('state machine — arm + cancel cycle', () => {
    const sm = createCompositionStateMachine();
    sm.arm('~', 'nasal-armed');
    sm.cancel();
  });

  bench('CompositionProcessor — dead key + base (full pipeline)', () => {
    const processor = createCompositionProcessor(desktopResolvedLayout());
    processor.process(createKeyId('key-acute'), '´');
    processor.process(createKeyId('key-a'), 'a');
  });

  bench('CompositionProcessor — plain char (no composition)', () => {
    const processor = createCompositionProcessor(desktopResolvedLayout());
    processor.process(createKeyId('key-n'), 'n');
  });
});

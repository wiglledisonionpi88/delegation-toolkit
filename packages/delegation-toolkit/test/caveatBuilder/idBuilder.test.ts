import { expect } from 'chai';
import { size, toHex } from 'viem';

import { idBuilder } from '../../src/caveatBuilder/idBuilder';
import type { DeleGatorEnvironment } from '../../src/types';
import { randomAddress } from '../utils';

describe('idBuilder()', () => {
  const EXPECTED_TERMS_LENGTH = 32; // 32 bytes for the id
  const environment = {
    caveatEnforcers: { IdEnforcer: randomAddress() },
  } as any as DeleGatorEnvironment;

  const buildWithId = (id: number) => {
    return idBuilder(environment, id);
  };

  describe('validation', () => {
    it('should fail with an invalid id (not a number)', () => {
      const invalidId = 'not-a-hex-string' as any;
      expect(() => buildWithId(invalidId)).to.throw(
        'Invalid id: must be an integer',
      );
    });

    it('should fail with an invalid id (not an integer)', () => {
      const invalidId = Math.random() * 2 ** 32;
      expect(() => buildWithId(invalidId)).to.throw(
        'Invalid id: must be an integer',
      );
    });

    it('should fail with an invalid id (negative)', () => {
      const invalidId = -1;
      expect(() => buildWithId(invalidId)).to.throw(
        'Invalid id: must be positive',
      );
    });

    it('should fail with an invalid id (too high)', () => {
      const invalidId = 2n ** 256n;
      expect(() => buildWithId(Number(invalidId))).to.throw(
        'Invalid id: must be less than 2^256',
      );
    });
  });

  describe('builds a caveat', () => {
    it('should build a caveat with a valid id', () => {
      const validId = Math.floor(Math.random() * 2 ** 32);

      const caveat = buildWithId(validId);

      const expectedTerms = toHex(validId, { size: 32 });

      expect(caveat).to.deep.equal({
        enforcer: environment.caveatEnforcers.IdEnforcer,
        terms: expectedTerms,
        args: '0x',
      });
    });
  });

  it('should create a caveat with terms length matching number of targets', () => {
    const id = Math.floor(Math.random() * 2 ** 32);

    const caveat = buildWithId(id);

    expect(size(caveat.terms)).to.equal(EXPECTED_TERMS_LENGTH);
  });
});

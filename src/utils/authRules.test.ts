import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateStaff,
  clampCropPan,
  evaluatePasswordPolicy,
  isValidIdentifierFormat,
  lookupAccountByIdentifier,
  normalizeRotation,
} from './authRules';
import { INITIAL_STAFF_ACCOUNTS } from '../data/authData';

test('lookupAccountByIdentifier matches NIP and email case-insensitively', () => {
  const byNip = lookupAccountByIdentifier(INITIAL_STAFF_ACCOUNTS, 'pst-2026-088');
  assert.equal(byNip?.id, 'PST-2026-088');

  const byEmail = lookupAccountByIdentifier(
    INITIAL_STAFF_ACCOUNTS,
    'SITI.RAHMAWATI@pustakamodern.id'
  );
  assert.equal(byEmail?.id, 'PST-2026-088');

  assert.equal(
    lookupAccountByIdentifier(INITIAL_STAFF_ACCOUNTS, 'tidak-ada'),
    null
  );
});

test('isValidIdentifierFormat validates NIP and institutional emails', () => {
  assert.equal(isValidIdentifierFormat('PST-2026-088'), true);
  assert.equal(isValidIdentifierFormat('ADM-9901-002'), true);
  assert.equal(isValidIdentifierFormat('siti.rahmawati@pustakamodern.id'), true);
  assert.equal(isValidIdentifierFormat('user@gmail.com'), false);
});

test('authenticateStaff accepts valid librarian & sysadmin credentials and blocks wrong role/password', () => {
  const okLibrarian = authenticateStaff({
    accounts: INITIAL_STAFF_ACCOUNTS,
    identifier: 'PST-2026-088',
    password: INITIAL_STAFF_ACCOUNTS[0].password,
    selectedRole: 'pustakawan',
  });
  assert.equal(okLibrarian.success, true);
  assert.equal(okLibrarian.account?.id, 'PST-2026-088');

  const wrongPassword = authenticateStaff({
    accounts: INITIAL_STAFF_ACCOUNTS,
    identifier: 'PST-2026-088',
    password: 'wrong-password',
    selectedRole: 'pustakawan',
  });
  assert.equal(wrongPassword.success, false);

  const escalatedRole = authenticateStaff({
    accounts: INITIAL_STAFF_ACCOUNTS,
    identifier: 'PST-2026-088',
    password: INITIAL_STAFF_ACCOUNTS[0].password,
    selectedRole: 'sysadmin',
  });
  assert.equal(escalatedRole.success, false);
});

test('evaluatePasswordPolicy enforces NIST SP 800-63B criteria, history, and confirmation match', () => {
  const weak = evaluatePasswordPolicy(
    'rahasia12',
    'berbeda12',
    INITIAL_STAFF_ACCOUNTS[0].passwordHistory
  );
  assert.equal(weak.isValidPolicy, false);
  assert.equal(weak.isConfirmMatch, false);
  assert.equal(weak.canSubmit, false);
  assert.equal(weak.scoreOutOf4, 1);
  assert.ok(weak.entropyBits < 45);

  const reused = evaluatePasswordPolicy(
    INITIAL_STAFF_ACCOUNTS[0].passwordHistory[0],
    INITIAL_STAFF_ACCOUNTS[0].passwordHistory[0],
    INITIAL_STAFF_ACCOUNTS[0].passwordHistory
  );
  assert.equal(reused.checks.notInHistory, false);
  assert.equal(reused.canSubmit, false);

  const strong = evaluatePasswordPolicy(
    'Bintang#Pustaka89!',
    'Bintang#Pustaka89!',
    INITIAL_STAFF_ACCOUNTS[0].passwordHistory
  );
  assert.equal(strong.isValidPolicy, true);
  assert.equal(strong.isConfirmMatch, true);
  assert.equal(strong.canSubmit, true);
  assert.equal(strong.scoreOutOf4, 4);
  assert.equal(strong.strengthLabel, 'Sangat Kuat');
});

test('crop helpers clamp pan offsets and normalize rotation angles', () => {
  assert.equal(clampCropPan(500, 100), 110);
  assert.equal(clampCropPan(-500, 100), -110);
  assert.equal(normalizeRotation(-90), 270);
  assert.equal(normalizeRotation(450), 90);
});

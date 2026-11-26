import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOverdueFine,
  canBorrowBook,
  computeCashBreakdown,
  filterAndSortBooks,
  processBorrowBook,
  processReturnBook,
  validateBookRegistration,
} from './libraryRules';
import {
  INITIAL_ACTIVE_LOANS,
  INITIAL_BOOKS,
  INITIAL_FINE_RECORDS,
  INITIAL_RETURN_HISTORY,
} from '../data/seedData';

test('FR-01 / BR-01 & BR-02: validates unique BK-XXX format and integer stock >= 0', () => {
  const duplicate = validateBookRegistration(
    { id: 'bk-001', title: 'Test', author: 'Author', initialStock: 3 },
    INITIAL_BOOKS
  );
  assert.equal(duplicate.valid, false);
  assert.ok(duplicate.errors.id);

  const badFormat = validateBookRegistration(
    { id: '123', title: 'Test', author: 'Author', initialStock: 3 },
    INITIAL_BOOKS
  );
  assert.equal(badFormat.valid, false);
  assert.ok(badFormat.errors.id);

  const negativeStock = validateBookRegistration(
    { id: 'BK-099', title: 'Test', author: 'Author', initialStock: -1 },
    INITIAL_BOOKS
  );
  assert.equal(negativeStock.valid, false);
  assert.ok(negativeStock.errors.initialStock);

  const decimalStock = validateBookRegistration(
    { id: 'BK-099', title: 'Test', author: 'Author', initialStock: 2.5 },
    INITIAL_BOOKS
  );
  assert.equal(decimalStock.valid, false);

  const valid = validateBookRegistration(
    { id: 'bk-009', title: 'Sains Modern', author: 'Dr. Carl S.', initialStock: 5 },
    INITIAL_BOOKS
  );
  assert.equal(valid.valid, true);
});

test('BR-03 & BR-04: blocks borrowing when stock is 0 and decrements atomically when available', () => {
  const emptyBook = INITIAL_BOOKS.find((b) => b.id === 'BK-003');
  assert.equal(canBorrowBook(emptyBook).allowed, false);

  const failedBorrow = processBorrowBook({
    books: INITIAL_BOOKS,
    loans: INITIAL_ACTIVE_LOANS,
    bookId: 'BK-003',
    memberInput: 'AG-2041 (Ahmad Fauzi)',
    transactionId: 'TRX-20261126-089',
  });
  assert.equal(failedBorrow.success, false);

  const okBorrow = processBorrowBook({
    books: INITIAL_BOOKS,
    loans: INITIAL_ACTIVE_LOANS,
    bookId: 'BK-001',
    memberInput: 'AG-2041 (Ahmad Fauzi)',
    transactionId: 'TRX-20261126-089',
  });
  assert.equal(okBorrow.success, true);
  assert.equal(okBorrow.previousStock, 3);
  assert.equal(okBorrow.newStock, 2);
  const updatedBk001 = okBorrow.books.find((b) => b.id === 'BK-001');
  assert.equal(updatedBk001?.availableStock, 2);
  assert.equal(okBorrow.loans[0].memberName, 'Ahmad Fauzi');
});

test('BR-05 & BR-07: return restores stock by +1 and computes overdue fines at Rp 1.000/day', () => {
  assert.equal(calculateOverdueFine(0), 0);
  assert.equal(calculateOverdueFine(7), 7000);

  const res = processReturnBook({
    books: INITIAL_BOOKS,
    loans: INITIAL_ACTIVE_LOANS,
    returns: INITIAL_RETURN_HISTORY,
    fines: INITIAL_FINE_RECORDS,
    transactionId: 'TRX-20261112-019',
    nextReceiptNumber: 78,
  });

  assert.equal(res.success, true);
  assert.equal(res.returnedRecord?.finePaid, 7000);
  assert.equal(res.returnedRecord?.overdueDays, 7);
  const bumiManusia = res.books.find((b) => b.id === 'BK-002');
  assert.equal(bumiManusia?.availableStock, 2);
});

test('Cash breakdown splits Rp 38.000 into exact 6 banknotes', () => {
  const breakdown = computeCashBreakdown(38000);
  assert.equal(breakdown.totalNotes, 6);
  assert.deepEqual(
    breakdown.denominations.map((d) => d.count),
    [1, 1, 1, 3]
  );
});

test('Catalog filter and search works by exact ID and partial title', () => {
  const byId = filterAndSortBooks(INITIAL_BOOKS, 'BK-001', 'all', 'all', 'title-asc');
  assert.equal(byId.length, 1);
  assert.equal(byId[0].title, 'Laskar Pelangi');

  const outOnly = filterAndSortBooks(INITIAL_BOOKS, '', 'out', 'all', 'title-asc');
  assert.equal(outOnly.length, 2);
});

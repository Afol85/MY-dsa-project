import test from 'node:test';
import assert from 'node:assert';
import { booking_states, transistions, canTransistion, assertTransistion} from '../src/domain/bookingStates.js';

test('Booking states should be defined correctly', () => {
    assert.deepEqual(booking_states, [
        'pending',
        'paid',
        'cancelled',
        'refunded',
        'checkedIn'
    ])
});

test('transistion rules should be defined correctly', () => {
    assert.deepEqual(transistions.pending, ['paid', 'cancelled']);

    assert.deepEqual(transistions.paid, ['checkedIn', 'cancelled', 'refunded']);

     assert.deepEqual(transistions.cancelled, []);

    assert.deepEqual(transistions.checkedIn, []);

    assert.deepEqual(transistions.refunded, []);
});

test('Valid transistion should be true', () => {
    assert.equal(canTransistion('pending', 'paid'), true);

    assert.equal(canTransistion('pending', 'cancelled'), true);

    assert.equal(canTransistion('paid', 'checkedIn'), true);

    assert.equal(canTransistion('paid', 'refunded'), true);
});


test('Invalid transistions should be false', () => {
    assert.equal(canTransistion('pending', 'refunded'), false);

    assert.equal(canTransistion('refunded', 'pending'), false);

    assert.equal(canTransistion('checkedIn', 'refunded'), false);

    assert.equal(canTransistion('checkedIn ', 'cancelled'), false);

    assert.equal(canTransistion('cancelled', 'paid'), false);
})


test('Unknown transistions should be false', () => {
    assert.equal(canTransistion('pending', 'unknown'),false);

    assert.equal(canTransistion('unknown', 'paid'), false);
})

test('assertTransistion should accept valid transistions', () => {
    assert.doesNotThrow(() => {assertTransistion('pending', 'paid')})
})

test('assertTransistion should reject invalid transistions', () => {
    assert.throws(() => {assertTransistion('checkedIn', 'refunded')});

    assert.throws(() => {assertTransistion('cancelled', 'paid')});
})

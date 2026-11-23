import test from  'node:test';
import assert from 'node:assert/strict';
import { createRouter } from '../src/http/router.js';

test('It should register and match a GET route', () => {
    const router = createRouter();

    const get = () => {};

    router.register('GET','/events', get);

    const result = router.match('GET', '/events');

    assert.equal(result.handler, get);
});
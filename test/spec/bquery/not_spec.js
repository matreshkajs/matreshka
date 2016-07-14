import $ from 'src/bquery';

describe('bQuery.fn.not', function test() {
    it('excludes by selector', () => {
        const el1 = document.createElement('div'),
            el2 = document.createElement('div'),
            el3 = document.createElement('div');

        el2.className = 'el2';

        expect([
            ...$([el1, el2, el3]).not('.el2')
        ]).toEqual([el1, el3]);
	});
});

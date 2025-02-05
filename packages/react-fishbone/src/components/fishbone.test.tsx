import { render } from '@testing-library/react'
import { configMocks, mockResizeObserver } from 'jsdom-testing-mocks';
import { afterAll, afterEach, test } from 'vitest';

import Fishbone from './fishbone';

if (typeof window !== 'undefined') {
    configMocks({ afterAll, afterEach });
    mockResizeObserver();
}

test('init', () => {
    render(
        <Fishbone 
            items={{
                label: 'Root',
                children: [],
            }} 
        />
    );
});
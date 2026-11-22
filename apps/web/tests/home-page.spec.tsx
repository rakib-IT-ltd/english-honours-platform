import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import HomePage from '../src/app/(public)/page';

afterEach(cleanup);

describe('HomePage', () => {
  it('renders the platform title and the Bangla line', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'English Honours Learning Platform' }),
    ).toBeTruthy();
    expect(document.querySelector('p[lang="bn"]')).not.toBeNull();
  });
});

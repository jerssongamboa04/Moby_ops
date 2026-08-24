import { render } from '@testing-library/react-native';

import Index from '../app/index';

describe('<Index />', () => {
  test('renders the initial screen message', async () => {
    const { getByText } = await render(<Index />);

    expect(
      getByText('Edit app/index.tsx to edit this screen.')
    ).toBeTruthy();
  });
});
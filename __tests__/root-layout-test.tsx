import { render } from '@testing-library/react-native';
import { AppState } from 'react-native';

import RootLayout from '../app/_layout';
import {
    registerAuthAutoRefresh,
} from '../src/lib/supabase/auth-auto-refresh';
import { supabase } from '../src/lib/supabase/client';

jest.mock('expo-router', () => ({
    Stack: () => null,
}));

jest.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

jest.mock(
    '../src/lib/supabase/auth-auto-refresh',
    () => ({
        registerAuthAutoRefresh: jest.fn(),
    })
);

jest.mock('../src/lib/supabase/client', () => ({
    supabase: {
        auth: {},
    },
}));

describe('<RootLayout />', () => {
    test('registers and removes Supabase auto refresh', async () => {
        const unregister = jest.fn();

        jest
            .mocked(registerAuthAutoRefresh)
            .mockReturnValue(unregister);

        const { unmount } = await render(<RootLayout />);

        expect(registerAuthAutoRefresh).toHaveBeenCalledWith(
            supabase,
            AppState
        );

        await unmount();
        expect(unregister).toHaveBeenCalledTimes(1);
    });
});
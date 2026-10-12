import 'react-native-url-polyfill/auto';

export function isAuthCallbackUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.protocol === 'mobyops:' &&
            parsedUrl.hostname === 'auth' &&
            parsedUrl.pathname === '/callback'
        );
    } catch {
        return false;
    }
}
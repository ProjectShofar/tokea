import { useTrigger } from "../utils/fetcher";

export function useZeroSSLInit() {
    return useTrigger({
        url: '/zerossl/init',
        method: 'POST'
    });
}
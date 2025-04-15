import { useGet, useTrigger } from "../utils/fetcher";

export function useGetConfigs() {
    return useGet({
        url: '/configs'
    });
}

export function useReloadConfigs() {
    return useTrigger({
        url: '/configs/reload',
        method: 'POST'
    });
}
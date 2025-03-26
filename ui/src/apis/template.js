import { useGet, useTrigger } from "../utils/fetcher";

export function useGetTemplates() {
    return useGet({
        url: '/templates'
    });
}

export function useInitTemplate({ type }) {
    return useTrigger({
        url: `/templates/${type}`,
        method: 'POST'
    })
}
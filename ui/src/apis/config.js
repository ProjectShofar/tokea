import { useGet } from "../utils/fetcher";

export function useGetConfigs() {
    return useGet({
        url: '/configs'
    });
}
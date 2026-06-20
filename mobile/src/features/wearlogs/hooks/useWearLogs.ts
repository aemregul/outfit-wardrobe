import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wearLogApi, WearLogListParams } from '../../../shared/api/wearLogApi';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';

export function useWearLogList(params?: WearLogListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WEAR_LOGS, params],
    queryFn: () => wearLogApi.list(params).then((r) => r.data.data),
  });
}

export function useInfiniteWearLogs(params?: Omit<WearLogListParams, 'page' | 'size'>) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.WEAR_LOGS, 'infinite', params ?? {}],
    queryFn: ({ pageParam }) =>
      wearLogApi.list({ ...params, page: pageParam as number, size: 20 }).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

export function useWearLog(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.WEAR_LOG_ITEM, id],
    queryFn: () => wearLogApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteWearLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wearLogApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.WEAR_LOGS] });
    },
  });
}

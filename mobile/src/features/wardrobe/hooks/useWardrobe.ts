import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wardrobeApi, ClothingListParams } from '../../../shared/api/wardrobeApi';
import type { ClothingItemRequest } from '../../../shared/types/clothing.types';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';

export function useAnalyzeClothing() {
  return useMutation({
    mutationFn: (imageUrl: string) => wardrobeApi.analyze(imageUrl).then((r) => r.data.data),
  });
}

export function useInfiniteWardrobe(params?: Omit<ClothingListParams, 'page' | 'size'>) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.CLOTHING, 'infinite', params ?? {}],
    queryFn: ({ pageParam }) =>
      wardrobeApi.list({ ...params, page: pageParam as number, size: 20 }).then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

export function useClothingList(params?: ClothingListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLOTHING, params],
    queryFn: () => wardrobeApi.list(params).then((r) => r.data.data),
  });
}

export function useClothingItem(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLOTHING_ITEM, id],
    queryFn: () => wardrobeApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateClothing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClothingItemRequest) => wardrobeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
    },
  });
}

export function useUpdateClothing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClothingItemRequest) => wardrobeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING_ITEM, id] });
    },
  });
}

export function useDeleteClothing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wardrobeApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
    },
  });
}

export function useMarkClean() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wardrobeApi.markClean(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING_ITEM, id] });
    },
  });
}

export function useMarkDirty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wardrobeApi.markDirty(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING_ITEM, id] });
    },
  });
}

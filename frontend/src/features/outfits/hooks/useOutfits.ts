import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { outfitApi, OutfitListParams } from '../../../shared/api/outfitApi';
import { AIGenerateRequest, OutfitRequest, WearLogRequest } from '../../../shared/types/outfit.types';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';

export function useInfiniteOutfits(params?: Omit<OutfitListParams, 'page' | 'size'>) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.OUTFITS, 'infinite', params ?? {}],
    queryFn: ({ pageParam }) =>
      outfitApi.list({ ...params, page: pageParam as number, size: 20 }).then(r => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.last ? undefined : lastPage.data.number + 1,
  });
}

export function useOutfitList(params?: OutfitListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.OUTFITS, params],
    queryFn: () => outfitApi.list(params).then((r) => r.data.data),
  });
}

export function useOutfit(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.OUTFIT_ITEM, id],
    queryFn: () => outfitApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OutfitRequest) => outfitApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
    },
  });
}

export function useDeleteOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outfitApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
    },
  });
}

export function useGenerateOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: AIGenerateRequest) => outfitApi.generate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
    },
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outfitApi.addFavorite(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFIT_ITEM, id] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outfitApi.removeFavorite(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFIT_ITEM, id] });
    },
  });
}

export function useMarkWorn(outfitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data?: WearLogRequest) => outfitApi.markWorn(outfitId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.WEAR_LOGS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFIT_ITEM, outfitId] });
    },
  });
}

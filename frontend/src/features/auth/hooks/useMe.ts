import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../../shared/api/userApi';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { useAuthStore } from '../store/authStore';
import type { UserProfileRequest } from '../../../shared/types/user.types';

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: [QUERY_KEYS.ME],
    queryFn: () => userApi.getMe().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileRequest) => userApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ME] });
    },
  });
}

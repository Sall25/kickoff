import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createJoinRequest, fetchJoinRequestCount } from '../api/client'

export function useJoinRequestCount(projectId: string) {
  return useQuery({
    queryKey: ['joinRequestCount', projectId],
    queryFn: () => fetchJoinRequestCount(projectId),
  })
}

export function useCreateJoinRequest(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJoinRequest,
    onSuccess: () => {
      queryClient.setQueryData<number>(
        ['joinRequestCount', projectId],
        (count) => (count ?? 0) + 1,
      )
    },
  })
}
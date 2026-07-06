import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  decideJoinRequest,
  fetchMyOnboardingKey,
  fetchMyRequests,
  fetchProjectMembers,
  listJoinRequests,
} from '../api/client'
import type { JoinRequest, RequestStatus } from '../api/types'

type Decision = Exclude<RequestStatus, 'pending'>

// Owner inbox — enabled once the owner passes the email gate. retry:false so
// an owner_mismatch surfaces immediately instead of retrying.
export function useOwnerInbox(projectId: string, ownerEmail: string | null) {
  return useQuery({
    queryKey: ['ownerInbox', projectId, ownerEmail],
    queryFn: () => listJoinRequests(projectId, ownerEmail!),
    enabled: Boolean(ownerEmail),
    retry: false,
  })
}

export function useDecideRequest(projectId: string, ownerEmail: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      requestId,
      decision,
    }: {
      requestId: string
      decision: Decision
    }) => decideJoinRequest(projectId, ownerEmail, requestId, decision),
    onSuccess: ({ status, decidedAt }, { requestId }) => {
      queryClient.setQueryData<JoinRequest[]>(
        ['ownerInbox', projectId, ownerEmail],
        (prev) =>
          prev
            ? prev.map((r) =>
                r.id === requestId ? { ...r, status, decidedAt } : r,
              )
            : prev,
      )
      // The public roster changes when a decision flips accept state.
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] })
    },
  })
}

// Contributor inbox — their own applications, scoped by session email.
export function useMyRequests(email: string | null) {
  return useQuery({
    queryKey: ['myRequests', email],
    queryFn: () => fetchMyRequests(email!),
    enabled: Boolean(email),
  })
}

// Public members board.
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => fetchProjectMembers(projectId),
  })
}

// Funnel-closer — only meaningful for an accepted contributor, so callers
// gate `enabled` on status === 'accepted'.
export function useMyOnboardingKey(
  projectId: string,
  email: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['myOnboardingKey', projectId, email],
    queryFn: () => fetchMyOnboardingKey(projectId, email!),
    enabled: enabled && Boolean(email),
    retry: false,
  })
}

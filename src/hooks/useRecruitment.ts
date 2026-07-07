import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  decideJoinRequest,
  fetchMyRequests,
  fetchProjectMembers,
  listJoinRequests,
  withdrawJoinRequest,
} from '../api/client'
import type { JoinRequest, MyRequest } from '../api/types'
import { useInboxSeen } from './useInboxSeen'

type Decision = 'accepted' | 'rejected'

// Count of the contributor's requests decided since they last opened their
// inbox — drives the header badge. Derived from their own request list, so it
// needs no notifications table and behaves the same in dev and prod.
export function useUnseenDecisions(email: string | null): number {
  const { data } = useMyRequests(email)
  const { seenAt } = useInboxSeen()
  if (!email || !data) return 0
  const seen = seenAt(email)
  return data.filter(
    (r) =>
      (r.status === 'accepted' || r.status === 'rejected') &&
      r.decidedAt !== null &&
      Date.parse(r.decidedAt) > seen,
  ).length
}

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

export function useWithdrawRequest(email: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => withdrawJoinRequest(requestId),
    onSuccess: ({ status }, requestId) => {
      queryClient.setQueryData<MyRequest[]>(['myRequests', email], (prev) =>
        prev
          ? prev.map((r) => (r.id === requestId ? { ...r, status } : r))
          : prev,
      )
    },
  })
}

// Public members board.
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => fetchProjectMembers(projectId),
  })
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchOnboardingMember,
  fetchOnboardingOwner,
  saveOnboarding,
} from '../api/client'
import type { OnboardingContent } from '../api/types'

// Membership-gated teammate read. Enabled once we have the signed-in email.
// retry:false — a non-member won't become a member on retry.
export function useOnboardingMember(projectId: string, email: string | null) {
  return useQuery({
    queryKey: ['onboardingMember', projectId, email],
    queryFn: () => fetchOnboardingMember(projectId, email!),
    enabled: Boolean(email),
    retry: false,
  })
}

// Owner read for the builder. Fired on demand (email gate submit),
// so it's a mutation rather than a query.
export function useOnboardingOwner(projectId: string) {
  return useMutation({
    mutationFn: (ownerEmail: string) =>
      fetchOnboardingOwner(projectId, ownerEmail),
  })
}

export function useSaveOnboarding(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ownerEmail,
      content,
    }: {
      ownerEmail: string
      content: OnboardingContent
    }) => saveOnboarding(projectId, ownerEmail, content),
    onSuccess: () => {
      // A member viewing this kit elsewhere should pick up the new content.
      queryClient.invalidateQueries({
        queryKey: ['onboardingMember', projectId],
      })
    },
  })
}
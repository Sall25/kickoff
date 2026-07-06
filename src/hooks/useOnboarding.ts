import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchOnboarding,
  fetchOnboardingOwner,
  saveOnboarding,
} from '../api/client'
import type { Onboarding, OnboardingContent } from '../api/types'

// Teammate read, gated by the share key from the acceptance link.
// retry: false — a wrong key won't become right on the third attempt.
export function useOnboarding(projectId: string, shareKey: string | null) {
  return useQuery({
    queryKey: ['onboarding', projectId, shareKey],
    queryFn: () => fetchOnboarding(projectId, shareKey!),
    enabled: Boolean(shareKey),
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
    onSuccess: ({ shareKey, updatedAt }, { content }) => {
      // Keep the teammate view in sync if it's opened in the same session.
      queryClient.setQueryData<Onboarding>(
        ['onboarding', projectId, shareKey],
        { projectId, content, updatedAt },
      )
    },
  })
}

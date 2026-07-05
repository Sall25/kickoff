import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProject, fetchProject, fetchProjects } from '../api/client'
import type { Project } from '../api/types'

function newestFirst(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    select: newestFirst,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: (created) => {
      queryClient.setQueryData<Project[]>(['projects'], (prev) =>
        prev ? [created, ...prev] : [created],
      )
      queryClient.setQueryData(['projects', created.id], created)
    },
  })
}

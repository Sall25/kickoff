import { Outlet, ReactLocation, Route, Router } from '@tanstack/react-location'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Browse } from './pages/Browse'
import { Inbox } from './pages/Inbox'
import { Landing } from './pages/Landing'
import { OnboardingEdit } from './pages/OnboardingEdit'
import { OnboardingView } from './pages/OnboardingView'
import { OwnerInbox } from './pages/OwnerInbox'
import { ProjectDetail } from './pages/ProjectDetail'
import { ProjectMembers } from './pages/ProjectMembers'
import { StartProject } from './pages/StartProject'

const location = new ReactLocation()

const routes: Route[] = [
  { path: '/', element: <Landing /> },
  {
    path: 'projects',
    children: [
      { path: '/', element: <Browse /> },
      {
        path: ':projectId',
        children: [
          { path: '/', element: <ProjectDetail /> },
          { path: 'requests', element: <OwnerInbox /> },
          { path: 'members', element: <ProjectMembers /> },
          {
            path: 'onboarding',
            children: [
              { path: '/', element: <OnboardingView /> },
              { path: 'edit', element: <OnboardingEdit /> },
            ],
          },
        ],
      },
    ],
  },
  { path: 'inbox', element: <Inbox /> },
  { path: 'start', element: <StartProject /> },
]

export function App() {
  return (
    <Router location={location} routes={routes}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </Router>
  )
}
import { Outlet, ReactLocation, Route, Router } from '@tanstack/react-location'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Browse } from './pages/Browse'
import { Landing } from './pages/Landing'
import { ProjectDetail } from './pages/ProjectDetail'
import { StartProject } from './pages/StartProject'

const location = new ReactLocation()

const routes: Route[] = [
  { path: '/', element: <Landing /> },
  {
    path: 'projects',
    children: [
      { path: '/', element: <Browse /> },
      { path: ':projectId', element: <ProjectDetail /> },
    ],
  },
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

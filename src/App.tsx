import Sidebar from "./components/layout/Sidebar/Sidebar"
import Dashboard from "./Pages/Dashboard/Dashborad"
import WorkspaceLayout from "./components/layout/Workspace/WorkspaceLayout"

export default function App() {
  return (
    <>
      <WorkspaceLayout>

        <Sidebar />

        <main className="h-screen overflow-y-auto">
          <Dashboard />
        </main>
      </WorkspaceLayout>
    </>
  )
}


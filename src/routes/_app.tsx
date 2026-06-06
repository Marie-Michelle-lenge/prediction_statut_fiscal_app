import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Sidebar from '@/components/Sidebar'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { getSessionFn } = await import('@/lib/server-auth')
    const { user } = await getSessionFn()
    if (!user) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  )
}

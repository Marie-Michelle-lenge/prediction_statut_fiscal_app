import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { getSessionFn } = await import('@/lib/server-auth')
    const { user } = await getSessionFn()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Outlet />
    </div>
  )
}

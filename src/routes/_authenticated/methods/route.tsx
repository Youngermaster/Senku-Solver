import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/methods')({
  component: MethodsLayout,
})

function MethodsLayout() {
  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Métodos Numéricos</h1>
        <p className='text-muted-foreground mt-2'>
          Herramientas para resolver problemas de análisis numérico
        </p>
      </div>
      <Outlet />
    </div>
  )
}

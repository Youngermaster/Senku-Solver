import { createFileRoute } from '@tanstack/react-router'
import JacobiMethod from '@/features/methods/jacobi/jacobi-method'

export const Route = createFileRoute('/_authenticated/methods/jacobi')({
  component: JacobiMethod,
})

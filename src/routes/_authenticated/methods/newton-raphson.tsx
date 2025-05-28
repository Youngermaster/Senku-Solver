import { createFileRoute } from '@tanstack/react-router'
import NewtonRaphsonMethod from '@/features/methods/newton-raphson/newton-raphson-method'

export const Route = createFileRoute('/_authenticated/methods/newton-raphson')({
  component: NewtonRaphsonMethod,
})

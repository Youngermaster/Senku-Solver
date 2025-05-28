import { createFileRoute } from '@tanstack/react-router'
import NewtonInterpolantMethod from '@/features/methods/newton-interpolant/newton-interpolant'

export const Route = createFileRoute(
  '/_authenticated/methods/newton-interpolant'
)({
  component: NewtonInterpolantMethod,
})

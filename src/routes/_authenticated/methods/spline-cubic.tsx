import { createFileRoute } from '@tanstack/react-router'
import SplineCubicMethod from '@/features/methods/spline-cubic/spline-cubic'

export const Route = createFileRoute('/_authenticated/methods/spline-cubic')({
  component: SplineCubicMethod,
})

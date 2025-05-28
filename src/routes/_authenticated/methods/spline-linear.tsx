import { createFileRoute } from '@tanstack/react-router'
import SplineLinearMethod from '@/features/methods/spline-linear/spline-linear'

export const Route = createFileRoute('/_authenticated/methods/spline-linear')({
  component: SplineLinearMethod,
})

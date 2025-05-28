import { createFileRoute } from '@tanstack/react-router'
import InterpolationComparison from '@/features/methods/interpolation-comparison/interpolation-comparison'

export const Route = createFileRoute(
  '/_authenticated/methods/interpolation-comparison'
)({
  component: InterpolationComparison,
})

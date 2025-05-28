import { createFileRoute } from '@tanstack/react-router'
import IterativeComparison from '@/features/methods/iterative-comparison/iterative-comparison'

export const Route = createFileRoute(
  '/_authenticated/methods/iterative-comparison'
)({
  component: IterativeComparison,
})

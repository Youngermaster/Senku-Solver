import { createFileRoute } from '@tanstack/react-router'
import MethodsComparison from '@/features/methods/comparison/methods-comparison'

export const Route = createFileRoute('/_authenticated/methods/comparison')({
  component: MethodsComparison,
})

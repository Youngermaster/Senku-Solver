import { createFileRoute } from '@tanstack/react-router'
import BisectionMethod from '@/features/methods/bisection/bisection-method'

export const Route = createFileRoute('/_authenticated/methods/bisection')({
  component: BisectionMethod,
})

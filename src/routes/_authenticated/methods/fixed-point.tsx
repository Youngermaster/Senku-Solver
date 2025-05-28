import { createFileRoute } from '@tanstack/react-router'
import FixedPointMethod from '@/features/methods/fixed-point/fixed-point-method'

export const Route = createFileRoute('/_authenticated/methods/fixed-point')({
  component: FixedPointMethod,
})

import { createFileRoute } from '@tanstack/react-router'
import FalsePositionMethod from '@/features/methods/false-position/false-position-method'

export const Route = createFileRoute('/_authenticated/methods/false-position')({
  component: FalsePositionMethod,
})

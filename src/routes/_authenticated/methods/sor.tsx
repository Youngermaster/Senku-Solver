import { createFileRoute } from '@tanstack/react-router'
import SORMethod from '@/features/methods/sor/sor-method'

export const Route = createFileRoute('/_authenticated/methods/sor')({
  component: SORMethod,
})

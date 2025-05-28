import { createFileRoute } from '@tanstack/react-router'
import SecantMethod from '@/features/methods/secant/secant-method'

export const Route = createFileRoute('/_authenticated/methods/secant')({
  component: SecantMethod,
})

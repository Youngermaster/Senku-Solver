import { createFileRoute } from '@tanstack/react-router'
import LagrangeMethod from '@/features/methods/lagrange/lagrange'

export const Route = createFileRoute('/_authenticated/methods/lagrange')({
  component: LagrangeMethod,
})

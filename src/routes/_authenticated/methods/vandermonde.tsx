import { createFileRoute } from '@tanstack/react-router'
import VandermondeMethod from '@/features/methods/vandermonde/vandermonde'

export const Route = createFileRoute('/_authenticated/methods/vandermonde')({
  component: VandermondeMethod,
})

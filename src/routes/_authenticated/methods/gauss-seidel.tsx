import { createFileRoute } from '@tanstack/react-router'
import GaussSeidelMethod from '@/features/methods/gauss-seidel/gauss-seidel-method'

export const Route = createFileRoute('/_authenticated/methods/gauss-seidel')({
  component: GaussSeidelMethod,
})

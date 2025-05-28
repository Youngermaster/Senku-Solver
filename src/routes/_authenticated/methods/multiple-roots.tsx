import { createFileRoute } from '@tanstack/react-router'
import MultipleRootsMethod from '@/features/methods/multiple-roots/multiple-roots-method'

export const Route = createFileRoute('/_authenticated/methods/multiple-roots')({
  component: MultipleRootsMethod,
})

import { IconLayoutDashboard, IconVariable } from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/avatars/john.jpg',
  },
  teams: [
    {
      name: 'Senku Solver',
      logo: Command,
      plan: 'Numerical Analysis',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Métodos de Raíces',
      items: [
        {
          title: 'Método de Bisección',
          url: '/methods/bisection',
          icon: IconVariable,
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
      ],
    },
  ],
}

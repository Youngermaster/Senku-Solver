import {
  IconLayoutDashboard,
  IconVariable,
  IconChartLine,
} from '@tabler/icons-react'
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
        {
          title: 'Método de Punto Fijo',
          url: '/methods/fixed-point',
          icon: IconVariable,
        },
        {
          title: 'Método de Regla Falsa',
          url: '/methods/false-position',
          icon: IconVariable,
        },
        {
          title: 'Método de Newton-Raphson',
          url: '/methods/newton-raphson',
          icon: IconVariable,
        },
        {
          title: 'Método de la Secante',
          url: '/methods/secant',
          icon: IconVariable,
        },
        {
          title: 'Método de Raíces Múltiples',
          url: '/methods/multiple-roots',
          icon: IconVariable,
        },
        {
          title: 'Comparación de Métodos',
          url: '/methods/comparison',
          icon: IconChartLine,
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

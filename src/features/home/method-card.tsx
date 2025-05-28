import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MethodCardProps {
  title: string
  description: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  category?: string
}

export default function MethodCard({
  title,
  description,
  url,
  icon: Icon,
  category,
}: MethodCardProps) {
  return (
    <Card className='group hover:shadow-primary/10 hover:border-primary/20 transition-all duration-200 hover:shadow-lg'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg transition-colors'>
              <Icon className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg leading-tight'>{title}</CardTitle>
              {category && (
                <p className='text-muted-foreground mt-1 text-xs'>{category}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <CardDescription className='mb-4 text-sm leading-relaxed'>
          {description}
        </CardDescription>
        <Link to={url}>
          <Button
            variant='ghost'
            className='group-hover:bg-primary/5 group-hover:text-primary w-full transition-colors'
          >
            Explorar método
            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

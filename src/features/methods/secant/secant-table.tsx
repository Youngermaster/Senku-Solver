import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SecantTableProps {
  data: {
    iteration: number
    x0: number
    x1: number
    fx0: number
    fx1: number
    error: number
  }[]
}

export default function SecantTable({ data }: SecantTableProps) {
  const formatNumber = (num: number, decimals: number = 6): string => {
    if (isNaN(num) || !isFinite(num)) return 'N/A'
    return num.toFixed(decimals)
  }

  const formatScientific = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return 'N/A'
    if (num === 0) return '0.000000'
    return num.toExponential(3)
  }

  return (
    <ScrollArea className='h-[400px] w-full rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Iteración</TableHead>
            <TableHead className='text-center'>x₀</TableHead>
            <TableHead className='text-center'>x₁</TableHead>
            <TableHead className='text-center'>f(x₀)</TableHead>
            <TableHead className='text-center'>f(x₁)</TableHead>
            <TableHead className='text-center'>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className='text-center font-medium'>
                {row.iteration}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatNumber(row.x0)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatNumber(row.x1)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fx0)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fx1)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {row.error === 0 ? '0.000000' : formatScientific(row.error)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

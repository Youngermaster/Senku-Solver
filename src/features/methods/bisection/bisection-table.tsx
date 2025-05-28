import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BisectionTableProps {
  data: {
    iteration: number
    xi: number
    xs: number
    xm: number
    fxi: number
    fxs: number
    fxm: number
    error: number
  }[]
}

export default function BisectionTable({ data }: BisectionTableProps) {
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
            <TableHead className='text-center'>xi</TableHead>
            <TableHead className='text-center'>xs</TableHead>
            <TableHead className='text-center'>xm</TableHead>
            <TableHead className='text-center'>f(xi)</TableHead>
            <TableHead className='text-center'>f(xs)</TableHead>
            <TableHead className='text-center'>f(xm)</TableHead>
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
                {formatNumber(row.xi)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatNumber(row.xs)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatNumber(row.xm)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fxi)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fxs)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fxm)}
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

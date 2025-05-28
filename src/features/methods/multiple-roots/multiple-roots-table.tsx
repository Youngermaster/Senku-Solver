import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MultipleRootsTableProps {
  data: {
    iteration: number
    xn: number
    fxn: number
    dfxn: number
    d2fxn: number
    error: number
  }[]
}

export default function MultipleRootsTable({ data }: MultipleRootsTableProps) {
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
            <TableHead className='text-center'>xₙ</TableHead>
            <TableHead className='text-center'>f(xₙ)</TableHead>
            <TableHead className='text-center'>f'(xₙ)</TableHead>
            <TableHead className='text-center'>f''(xₙ)</TableHead>
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
                {formatNumber(row.xn)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.fxn)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.dfxn)}
              </TableCell>
              <TableCell className='text-center font-mono'>
                {formatScientific(row.d2fxn)}
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

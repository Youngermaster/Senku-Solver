import { type JacobiIteration } from '@/utils/algorithms/jacobi'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface JacobiTableProps {
  iterations: JacobiIteration[]
}

export default function JacobiTable({ iterations }: JacobiTableProps) {
  if (iterations.length === 0) return null

  const variableCount = iterations[0]?.x.length || 0
  const displayIterations = iterations.slice(0, 50) // Limit to first 50 iterations for performance

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Iteraciones</CardTitle>
        <CardDescription>
          Evolución de las variables en cada iteración del método de Jacobi
          {iterations.length > 50 &&
            ` (mostrando primeras 50 de ${iterations.length})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Iteración</TableHead>
                {Array.from({ length: variableCount }, (_, i) => (
                  <TableHead key={`x${i}`} className='text-center'>
                    x<sub>{i + 1}</sub>
                  </TableHead>
                ))}
                <TableHead className='text-center'>Error</TableHead>
                <TableHead className='text-center'>Error Relativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayIterations.map((iteration) => (
                <TableRow key={iteration.iteration}>
                  <TableCell className='text-center font-medium'>
                    {iteration.iteration}
                  </TableCell>
                  {iteration.x.map((value, index) => (
                    <TableCell
                      key={`x${index}-${iteration.iteration}`}
                      className='text-center font-mono'
                    >
                      {value.toFixed(8)}
                    </TableCell>
                  ))}
                  <TableCell className='text-center font-mono'>
                    {iteration.error.toExponential(3)}
                  </TableCell>
                  <TableCell className='text-center font-mono'>
                    {iteration.relativeError.toExponential(3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {iterations.length > 50 && (
          <div className='text-muted-foreground mt-4 text-center text-sm'>
            Tabla truncada por rendimiento. Usa "Exportar CSV" para obtener
            todos los datos.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

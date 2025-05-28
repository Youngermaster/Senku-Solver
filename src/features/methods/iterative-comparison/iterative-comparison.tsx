import { useState } from 'react'
import { BarChart3, Calculator, Download, Play, Lightbulb } from 'lucide-react'
import { gaussSeidel } from '@/utils/algorithms/gauss-seidel'
import { jacobi } from '@/utils/algorithms/jacobi'
import { sor } from '@/utils/algorithms/sor'
import { estimateOptimalOmega } from '@/utils/matrix-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import MatrixInput from '../common/matrix-input'

interface IterativeComparisonResult {
  method: string
  converged: boolean
  solution: number[]
  error: number
  iterations: number
  executionTime: number
  spectralRadius: number
  canConverge: boolean
  relaxationFactor?: number
  message: string
}

// Default example for quick testing
const defaultMatrix = [
  [4, -1, 0],
  [-1, 4, -1],
  [0, -1, 4],
]

const defaultVector = [3, 7, 6]

const defaultInitialGuess = [0, 0, 0]

export default function IterativeComparison() {
  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix)
  const [vector, setVector] = useState<number[]>(defaultVector)
  const [initialGuess, setInitialGuess] =
    useState<number[]>(defaultInitialGuess)
  const [tolerance, setTolerance] = useState('1e-7')
  const [maxIterations, setMaxIterations] = useState('100')
  const [customOmega, setCustomOmega] = useState('1.2')
  const [useEstimatedOmega, setUseEstimatedOmega] = useState(true)
  const [runComparison, setRunComparison] = useState(false)

  const [results, setResults] = useState<IterativeComparisonResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [bestMethod, setBestMethod] = useState<string>('')
  const [estimatedOmega, setEstimatedOmega] = useState<number | null>(null)

  const handleMatrixChange = (newMatrix: number[][]) => {
    setMatrix(newMatrix)
    if (newMatrix.length > 0) {
      const estimated = estimateOptimalOmega(newMatrix)
      setEstimatedOmega(estimated)
    }
  }

  // Calculate estimated omega for the default matrix on component mount
  useState(() => {
    if (defaultMatrix.length > 0) {
      const estimated = estimateOptimalOmega(defaultMatrix)
      setEstimatedOmega(estimated)
    }
  })

  const executeComparison = async () => {
    if (matrix.length === 0) {
      alert('Por favor configura el sistema de ecuaciones primero')
      return
    }

    setIsRunning(true)
    const comparisonResults: IterativeComparisonResult[] = []
    const tol = parseFloat(tolerance)
    const maxIter = parseInt(maxIterations)

    try {
      // Jacobi Method
      const startJacobi = performance.now()
      const jacobiResult = jacobi({
        matrix,
        vector,
        initialGuess,
        tolerance: tol,
        maxIterations: maxIter,
      })
      const endJacobi = performance.now()

      comparisonResults.push({
        method: 'Jacobi',
        converged: jacobiResult.converged,
        solution: jacobiResult.solution,
        error: jacobiResult.finalError,
        iterations: jacobiResult.totalIterations,
        executionTime: endJacobi - startJacobi,
        spectralRadius: jacobiResult.spectralRadius,
        canConverge: jacobiResult.canConverge,
        message: jacobiResult.converged
          ? `Convergió en ${jacobiResult.totalIterations} iteraciones`
          : `No convergió después de ${jacobiResult.totalIterations} iteraciones`,
      })

      // Gauss-Seidel Method
      const startGaussSeidel = performance.now()
      const gaussSeidelResult = gaussSeidel({
        matrix,
        vector,
        initialGuess,
        tolerance: tol,
        maxIterations: maxIter,
      })
      const endGaussSeidel = performance.now()

      comparisonResults.push({
        method: 'Gauss-Seidel',
        converged: gaussSeidelResult.converged,
        solution: gaussSeidelResult.solution,
        error: gaussSeidelResult.finalError,
        iterations: gaussSeidelResult.totalIterations,
        executionTime: endGaussSeidel - startGaussSeidel,
        spectralRadius: gaussSeidelResult.spectralRadius,
        canConverge: gaussSeidelResult.canConverge,
        message: gaussSeidelResult.converged
          ? `Convergió en ${gaussSeidelResult.totalIterations} iteraciones`
          : `No convergió después de ${gaussSeidelResult.totalIterations} iteraciones`,
      })

      // SOR Method
      const omega =
        useEstimatedOmega && estimatedOmega
          ? estimatedOmega
          : parseFloat(customOmega)

      const startSOR = performance.now()
      const sorResult = sor({
        matrix,
        vector,
        initialGuess,
        tolerance: tol,
        maxIterations: maxIter,
        relaxationFactor: omega,
      })
      const endSOR = performance.now()

      comparisonResults.push({
        method: 'SOR',
        converged: sorResult.converged,
        solution: sorResult.solution,
        error: sorResult.finalError,
        iterations: sorResult.totalIterations,
        executionTime: endSOR - startSOR,
        spectralRadius: sorResult.spectralRadius,
        canConverge: sorResult.canConverge,
        relaxationFactor: omega,
        message: sorResult.converged
          ? `Convergió en ${sorResult.totalIterations} iteraciones (ω=${omega.toFixed(3)})`
          : `No convergió después de ${sorResult.totalIterations} iteraciones (ω=${omega.toFixed(3)})`,
      })

      setResults(comparisonResults)

      // Determine best method (converged with least iterations, then by time)
      const convergedResults = comparisonResults.filter((r) => r.converged)
      if (convergedResults.length > 0) {
        const best = convergedResults.reduce((prev, current) => {
          if (prev.iterations !== current.iterations) {
            return prev.iterations < current.iterations ? prev : current
          }
          return prev.executionTime < current.executionTime ? prev : current
        })
        setBestMethod(best.method)
      } else {
        setBestMethod('Ninguno convergió')
      }
    } catch (error) {
      console.error('Error in iterative comparison:', error)
      alert(
        'Error durante la comparación: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      )
    } finally {
      setIsRunning(false)
    }
  }

  const exportResults = () => {
    if (results.length === 0) return

    const csvContent = [
      'Método,Convergió,Radio Espectral,Puede Converger,Iteraciones,Error Final,Tiempo (ms),Solución,Factor ω,Mensaje',
      ...results.map((r) => {
        const solutionStr = r.solution.map((x) => x.toFixed(8)).join(';')
        const omegaStr = r.relaxationFactor
          ? r.relaxationFactor.toFixed(3)
          : 'N/A'
        return `${r.method},${r.converged ? 'Sí' : 'No'},${r.spectralRadius.toFixed(6)},${r.canConverge ? 'Sí' : 'No'},${r.iterations},${r.error.toExponential(4)},${r.executionTime.toFixed(2)},"${solutionStr}",${omegaStr},${r.message}`
      }),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'iterative_methods_comparison.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <BarChart3 className='text-primary h-8 w-8' />
        <div>
          <h2 className='text-2xl font-bold'>
            Comparación de Métodos Iterativos
          </h2>
          <p className='text-muted-foreground'>
            Compara el rendimiento de Jacobi, Gauss-Seidel y SOR con el mismo
            sistema Ax = b
          </p>
        </div>
      </div>

      {/* Matrix Input */}
      <MatrixInput
        onMatrixChange={handleMatrixChange}
        onVectorChange={setVector}
        onInitialGuessChange={setInitialGuess}
        matrix={matrix}
        vector={vector}
        initialGuess={initialGuess}
      />

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Comparación</CardTitle>
          <CardDescription>
            Configura los parámetros para comparar los métodos iterativos
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='tolerance'>Tolerancia</Label>
              <Input
                id='tolerance'
                type='number'
                step='1e-10'
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                placeholder='1e-7'
              />
            </div>
            <div>
              <Label htmlFor='maxIterations'>Máximo de Iteraciones</Label>
              <Input
                id='maxIterations'
                type='number'
                value={maxIterations}
                onChange={(e) => setMaxIterations(e.target.value)}
                placeholder='100'
              />
            </div>
          </div>

          {/* SOR Configuration */}
          <div className='space-y-4'>
            <Label className='text-base font-medium'>Configuración SOR</Label>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='use-estimated'
                  checked={useEstimatedOmega}
                  onCheckedChange={(checked) =>
                    setUseEstimatedOmega(checked as boolean)
                  }
                />
                <Label htmlFor='use-estimated' className='text-sm'>
                  Usar ω estimado automáticamente{' '}
                  {estimatedOmega && `(≈ ${estimatedOmega.toFixed(3)})`}
                </Label>
              </div>

              {!useEstimatedOmega && (
                <div>
                  <Label htmlFor='custom-omega'>
                    Factor de Relajación Personalizado (ω)
                  </Label>
                  <Input
                    id='custom-omega'
                    type='number'
                    step='0.001'
                    min='0.001'
                    max='1.999'
                    value={customOmega}
                    onChange={(e) => setCustomOmega(e.target.value)}
                    placeholder='1.2'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Run Comparison Option */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='run-comparison'
              checked={runComparison}
              onCheckedChange={(checked) =>
                setRunComparison(checked as boolean)
              }
            />
            <Label htmlFor='run-comparison' className='text-sm'>
              Generar informe automático de comparación
            </Label>
          </div>

          {estimatedOmega !== null && (
            <Alert>
              <Lightbulb className='h-4 w-4' />
              <AlertDescription>
                <strong>Análisis automático:</strong> ω óptimo estimado ≈{' '}
                {estimatedOmega.toFixed(3)}. SOR puede converger más rápido que
                Gauss-Seidel con este valor.
              </AlertDescription>
            </Alert>
          )}

          <div className='flex gap-2 pt-4'>
            <Button
              onClick={executeComparison}
              disabled={isRunning || matrix.length === 0}
              className='flex-1'
            >
              <Play className='mr-2 h-4 w-4' />
              {isRunning
                ? 'Ejecutando Comparación...'
                : 'Comparar Métodos Iterativos'}
            </Button>
            {results.length > 0 && (
              <Button variant='outline' onClick={exportResults}>
                <Download className='mr-2 h-4 w-4' />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Best Method Alert */}
          <Alert>
            <Calculator className='h-4 w-4' />
            <AlertDescription>
              <strong>Mejor método:</strong> {bestMethod}
              {bestMethod !== 'Ninguno convergió' &&
                ' (basado en convergencia, iteraciones y tiempo de ejecución)'}
            </AlertDescription>
          </Alert>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Comparación</CardTitle>
              <CardDescription>
                Análisis comparativo detallado de los métodos iterativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className='h-[600px] w-full rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead className='text-center'>Estado</TableHead>
                      <TableHead className='text-center'>
                        Radio Espectral
                      </TableHead>
                      <TableHead className='text-center'>
                        Convergencia Teórica
                      </TableHead>
                      <TableHead className='text-center'>Iteraciones</TableHead>
                      <TableHead className='text-center'>Error Final</TableHead>
                      <TableHead className='text-center'>Tiempo (ms)</TableHead>
                      <TableHead className='text-center'>Factor ω</TableHead>
                      <TableHead>Solución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow
                        key={index}
                        className={
                          result.method === bestMethod
                            ? 'bg-green-50 dark:bg-green-950'
                            : ''
                        }
                      >
                        <TableCell className='font-medium'>
                          {result.method}
                          {result.method === bestMethod && (
                            <Badge variant='default' className='ml-2'>
                              Mejor
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              result.converged ? 'default' : 'destructive'
                            }
                          >
                            {result.converged ? 'Convergió' : 'No convergió'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          <span
                            className={
                              result.spectralRadius < 1
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {formatNumber(result.spectralRadius, 6)}
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              result.canConverge ? 'default' : 'secondary'
                            }
                          >
                            {result.canConverge ? 'ρ < 1' : 'ρ ≥ 1'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {result.iterations}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {formatScientific(result.error)}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {result.executionTime.toFixed(2)}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {result.relaxationFactor
                            ? result.relaxationFactor.toFixed(3)
                            : 'N/A'}
                        </TableCell>
                        <TableCell className='font-mono text-xs'>
                          {result.solution.map((val, i) => (
                            <div key={i}>
                              x{i + 1}: {formatNumber(val, 4)}
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Métodos Convergentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {results.filter((r) => r.converged).length} / {results.length}
                </div>
                <p className='text-muted-foreground text-xs'>
                  de {results.length} métodos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Promedio de Iteraciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {results.filter((r) => r.converged).length > 0
                    ? (
                        results
                          .filter((r) => r.converged)
                          .reduce((sum, r) => sum + r.iterations, 0) /
                        results.filter((r) => r.converged).length
                      ).toFixed(1)
                    : 'N/A'}
                </div>
                <p className='text-muted-foreground text-xs'>
                  métodos convergentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Mejor Radio Espectral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {Math.min(...results.map((r) => r.spectralRadius)).toFixed(3)}
                </div>
                <p className='text-muted-foreground text-xs'>menor es mejor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Tiempo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {results
                    .reduce((sum, r) => sum + r.executionTime, 0)
                    .toFixed(2)}
                </div>
                <p className='text-muted-foreground text-xs'>milisegundos</p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Report */}
          {runComparison && (
            <Card>
              <CardHeader>
                <CardTitle>Informe Automático de Análisis</CardTitle>
                <CardDescription>
                  Análisis detallado del rendimiento comparativo
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <h4 className='font-semibold'>Análisis de Convergencia:</h4>
                  <ul className='list-inside list-disc space-y-1 text-sm'>
                    {results.map((result, i) => (
                      <li
                        key={i}
                        className={
                          result.canConverge ? 'text-green-700' : 'text-red-700'
                        }
                      >
                        <strong>{result.method}:</strong>{' '}
                        {result.canConverge
                          ? `Convergencia garantizada (ρ = ${result.spectralRadius.toFixed(4)} < 1)`
                          : `Convergencia no garantizada (ρ = ${result.spectralRadius.toFixed(4)} ≥ 1)`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold'>Rendimiento Comparativo:</h4>
                  <div className='space-y-1 text-sm'>
                    {(() => {
                      const converged = results.filter((r) => r.converged)
                      if (converged.length === 0) {
                        return (
                          <p className='text-red-600'>
                            Ningún método convergió. Considera revisar la matriz
                            o aumentar las iteraciones.
                          </p>
                        )
                      }

                      const fastest = converged.reduce((prev, curr) =>
                        prev.iterations < curr.iterations ? prev : curr
                      )
                      const mostEfficient = converged.reduce((prev, curr) =>
                        prev.executionTime < curr.executionTime ? prev : curr
                      )

                      return (
                        <div>
                          <p>
                            • <strong>Menor iteraciones:</strong>{' '}
                            {fastest.method} ({fastest.iterations} iteraciones)
                          </p>
                          <p>
                            • <strong>Más rápido:</strong>{' '}
                            {mostEfficient.method} (
                            {mostEfficient.executionTime.toFixed(2)} ms)
                          </p>
                          <p>
                            • <strong>Mejor radio espectral:</strong>{' '}
                            {
                              results.reduce((prev, curr) =>
                                prev.spectralRadius < curr.spectralRadius
                                  ? prev
                                  : curr
                              ).method
                            }
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold'>Recomendaciones:</h4>
                  <div className='space-y-1 text-sm'>
                    {(() => {
                      const allConverged = results.every((r) => r.converged)
                      const someConverged = results.some((r) => r.converged)

                      if (allConverged) {
                        return (
                          <div>
                            <p className='text-green-600'>
                              ✅ Todos los métodos convergieron exitosamente.
                            </p>
                            <p>
                              • Para este sistema, se recomienda usar{' '}
                              <strong>{bestMethod}</strong> por su eficiencia
                              general.
                            </p>
                            <p>
                              • La matriz presenta buenas condiciones para
                              métodos iterativos.
                            </p>
                          </div>
                        )
                      } else if (someConverged) {
                        return (
                          <div>
                            <p className='text-yellow-600'>
                              ⚠️ Solo algunos métodos convergieron.
                            </p>
                            <p>
                              • Usar <strong>{bestMethod}</strong> para este
                              sistema.
                            </p>
                            <p>
                              • Considerar mejorar la dominancia diagonal de la
                              matriz.
                            </p>
                          </div>
                        )
                      } else {
                        return (
                          <div>
                            <p className='text-red-600'>
                              ❌ Ningún método convergió.
                            </p>
                            <p>
                              • Verificar que la matriz tenga dominancia
                              diagonal.
                            </p>
                            <p>• Aumentar el número máximo de iteraciones.</p>
                            <p>
                              • Considerar usar métodos directos (eliminación
                              gaussiana).
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

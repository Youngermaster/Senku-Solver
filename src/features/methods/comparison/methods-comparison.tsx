import { useState } from 'react'
import { BarChart3, Calculator, Download, Play } from 'lucide-react'
import { bisectionMethod } from '@/utils/algorithms/bisection'
import { falsePositionMethod } from '@/utils/algorithms/false-position'
import { fixedPointMethod } from '@/utils/algorithms/fixed-point'
import { multipleRootsMethod } from '@/utils/algorithms/multiple-roots'
import { newtonRaphsonMethod } from '@/utils/algorithms/newton-raphson'
import { secantMethod } from '@/utils/algorithms/secant'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

interface ComparisonResult {
  method: string
  converged: boolean
  root: number
  error: number
  iterations: number
  executionTime: number
  message: string
}

export default function MethodsComparison() {
  const [functionExpression, setFunctionExpression] = useState(
    'log(sin(x)**2 + 1) - 1/2'
  )
  const [derivativeExpression, setDerivativeExpression] = useState(
    '(2*sin(x)*cos(x))/(sin(x)**2 + 1)'
  )
  const [secondDerivativeExpression, setSecondDerivativeExpression] = useState(
    '(2*cos(2*x))/(sin(x)**2 + 1) - (4*sin(x)**2*cos(x)**2)/(sin(x)**2 + 1)**2'
  )
  const [gFunctionExpression, setGFunctionExpression] = useState(
    'log(sin(x)**2 + 1) - 1/2 + x'
  )
  const [tolerance, setTolerance] = useState(0.0001)
  const [maxIterations, setMaxIterations] = useState(100)

  const [results, setResults] = useState<ComparisonResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [bestMethod, setBestMethod] = useState<string>('')

  const runComparison = async () => {
    setIsRunning(true)
    const comparisonResults: ComparisonResult[] = []

    try {
      // Bisection Method
      const startBisection = performance.now()
      const bisectionResult = bisectionMethod({
        xi: 0,
        xs: 1,
        tolerance,
        maxIterations,
        functionExpression,
      })
      const endBisection = performance.now()

      comparisonResults.push({
        method: 'Bisección',
        converged: bisectionResult.converged,
        root: bisectionResult.root,
        error: bisectionResult.error,
        iterations: bisectionResult.iterations,
        executionTime: endBisection - startBisection,
        message: bisectionResult.message,
      })

      // False Position Method
      const startFalsePosition = performance.now()
      const falsePositionResult = falsePositionMethod({
        xi: 0,
        xs: 1,
        tolerance,
        maxIterations,
        functionExpression,
      })
      const endFalsePosition = performance.now()

      comparisonResults.push({
        method: 'Regla Falsa',
        converged: falsePositionResult.converged,
        root: falsePositionResult.root,
        error: falsePositionResult.error,
        iterations: falsePositionResult.iterations,
        executionTime: endFalsePosition - startFalsePosition,
        message: falsePositionResult.message,
      })

      // Fixed Point Method
      const startFixedPoint = performance.now()
      const fixedPointResult = fixedPointMethod({
        x0: 0.5,
        tolerance,
        maxIterations,
        functionExpression,
        gFunctionExpression,
      })
      const endFixedPoint = performance.now()

      comparisonResults.push({
        method: 'Punto Fijo',
        converged: fixedPointResult.converged,
        root: fixedPointResult.root,
        error: fixedPointResult.error,
        iterations: fixedPointResult.iterations,
        executionTime: endFixedPoint - startFixedPoint,
        message: fixedPointResult.message,
      })

      // Newton-Raphson Method
      const startNewton = performance.now()
      const newtonResult = newtonRaphsonMethod({
        x0: 0.5,
        tolerance,
        maxIterations,
        functionExpression,
        derivativeExpression,
      })
      const endNewton = performance.now()

      comparisonResults.push({
        method: 'Newton-Raphson',
        converged: newtonResult.converged,
        root: newtonResult.root,
        error: newtonResult.error,
        iterations: newtonResult.iterations,
        executionTime: endNewton - startNewton,
        message: newtonResult.message,
      })

      // Secant Method
      const startSecant = performance.now()
      const secantResult = secantMethod({
        x0: 0,
        x1: 1,
        tolerance,
        maxIterations,
        functionExpression,
      })
      const endSecant = performance.now()

      comparisonResults.push({
        method: 'Secante',
        converged: secantResult.converged,
        root: secantResult.root,
        error: secantResult.error,
        iterations: secantResult.iterations,
        executionTime: endSecant - startSecant,
        message: secantResult.message,
      })

      // Multiple Roots Method
      const startMultiple = performance.now()
      const multipleResult = multipleRootsMethod({
        x0: 0.5,
        tolerance,
        maxIterations,
        functionExpression,
        derivativeExpression,
        secondDerivativeExpression,
      })
      const endMultiple = performance.now()

      comparisonResults.push({
        method: 'Raíces Múltiples',
        converged: multipleResult.converged,
        root: multipleResult.root,
        error: multipleResult.error,
        iterations: multipleResult.iterations,
        executionTime: endMultiple - startMultiple,
        message: multipleResult.message,
      })

      setResults(comparisonResults)

      // Determine best method (converged with least iterations)
      const convergedResults = comparisonResults.filter((r) => r.converged)
      if (convergedResults.length > 0) {
        const best = convergedResults.reduce((prev, current) =>
          prev.iterations < current.iterations ? prev : current
        )
        setBestMethod(best.method)
      } else {
        setBestMethod('Ninguno convergió')
      }
    } catch (error) {
      console.error('Error in comparison:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const exportResults = () => {
    const csvContent = [
      'Método,Convergió,Raíz,Error,Iteraciones,Tiempo (ms),Mensaje',
      ...results.map(
        (r) =>
          `${r.method},${r.converged ? 'Sí' : 'No'},${r.root.toFixed(8)},${r.error.toExponential(4)},${r.iterations},${r.executionTime.toFixed(2)},${r.message}`
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'comparison_results.csv'
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
          <h2 className='text-2xl font-bold'>Comparación de Métodos</h2>
          <p className='text-muted-foreground'>
            Compara el rendimiento de todos los métodos numéricos con la misma
            función
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Análisis</CardTitle>
          <CardDescription>
            Define la función y parámetros para comparar todos los métodos
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='function'>Función f(x)</Label>
            <Textarea
              id='function'
              placeholder='Ejemplo: log(sin(x)**2 + 1) - 1/2'
              value={functionExpression}
              onChange={(e) => setFunctionExpression(e.target.value)}
              className='font-mono'
              rows={2}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='derivative'>
              Derivada f'(x) (para Newton y Raíces Múltiples)
            </Label>
            <Textarea
              id='derivative'
              placeholder='Ejemplo: (2*sin(x)*cos(x))/(sin(x)**2 + 1)'
              value={derivativeExpression}
              onChange={(e) => setDerivativeExpression(e.target.value)}
              className='font-mono'
              rows={2}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='secondDerivative'>
              Segunda derivada f''(x) (para Raíces Múltiples)
            </Label>
            <Textarea
              id='secondDerivative'
              placeholder='Ejemplo: (2*cos(2*x))/(sin(x)**2 + 1) - (4*sin(x)**2*cos(x)**2)/(sin(x)**2 + 1)**2'
              value={secondDerivativeExpression}
              onChange={(e) => setSecondDerivativeExpression(e.target.value)}
              className='font-mono'
              rows={2}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='gFunction'>Función g(x) (para Punto Fijo)</Label>
            <Textarea
              id='gFunction'
              placeholder='Ejemplo: log(sin(x)**2 + 1) - 1/2 + x'
              value={gFunctionExpression}
              onChange={(e) => setGFunctionExpression(e.target.value)}
              className='font-mono'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='tolerance'>Tolerancia</Label>
              <Input
                id='tolerance'
                type='number'
                step='any'
                value={tolerance}
                onChange={(e) =>
                  setTolerance(parseFloat(e.target.value) || 0.0001)
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='maxIterations'>Máx. Iteraciones</Label>
              <Input
                id='maxIterations'
                type='number'
                value={maxIterations}
                onChange={(e) =>
                  setMaxIterations(parseInt(e.target.value) || 100)
                }
              />
            </div>
          </div>

          <div className='flex gap-2 pt-4'>
            <Button
              onClick={runComparison}
              disabled={isRunning}
              className='flex-1'
            >
              <Play className='mr-2 h-4 w-4' />
              {isRunning ? 'Ejecutando...' : 'Ejecutar Comparación'}
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
              <strong>Mejor método:</strong> {bestMethod} (basado en
              convergencia y menor número de iteraciones)
            </AlertDescription>
          </Alert>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Comparación</CardTitle>
              <CardDescription>
                Comparación detallada del rendimiento de todos los métodos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className='h-[500px] w-full rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead className='text-center'>Estado</TableHead>
                      <TableHead className='text-center'>Raíz</TableHead>
                      <TableHead className='text-center'>Error</TableHead>
                      <TableHead className='text-center'>Iteraciones</TableHead>
                      <TableHead className='text-center'>Tiempo (ms)</TableHead>
                      <TableHead>Mensaje</TableHead>
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
                          {formatNumber(result.root)}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {formatScientific(result.error)}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {result.iterations}
                        </TableCell>
                        <TableCell className='text-center font-mono'>
                          {result.executionTime.toFixed(2)}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {result.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
                  {(
                    results
                      .filter((r) => r.converged)
                      .reduce((sum, r) => sum + r.iterations, 0) /
                    results.filter((r) => r.converged).length
                  ).toFixed(1)}
                </div>
                <p className='text-muted-foreground text-xs'>
                  métodos convergentes
                </p>
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
        </>
      )}
    </div>
  )
}

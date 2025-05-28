import { useState } from 'react'
import {
  Play,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { solveLagrange, type LagrangeResult } from '@/utils/algorithms/lagrange'
import {
  solveNewtonInterpolant,
  type NewtonInterpolantResult,
} from '@/utils/algorithms/newton-interpolant'
import {
  solveSplineCubic,
  type SplineCubicResult,
} from '@/utils/algorithms/spline-cubic'
import {
  solveSplineLinear,
  type SplineLinearResult,
} from '@/utils/algorithms/spline-linear'
import {
  solveVandermonde,
  type VandermondeResult,
} from '@/utils/algorithms/vandermonde'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataPointsInput, {
  type DataPoint,
} from '@/features/methods/common/data-points-input'

interface ComparisonResult {
  method: string
  result:
    | VandermondeResult
    | NewtonInterpolantResult
    | LagrangeResult
    | SplineLinearResult
    | SplineCubicResult
    | null
  executionTime: number
  converged: boolean
  polynomial: string
  error?: string
}

export default function InterpolationComparison() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: 2, y: 9 },
    { x: 3, y: 16 },
  ])
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [bestMethod, setBestMethod] = useState<string>('')

  const runComparison = async () => {
    if (dataPoints.length < 2) return

    setIsCalculating(true)
    setBestMethod('')

    const comparisonResults: ComparisonResult[] = []

    try {
      // Run Vandermonde
      const vandermondeData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const vandermondeResult = solveVandermonde(vandermondeData)
      comparisonResults.push({
        method: 'Vandermonde',
        result: vandermondeResult,
        executionTime: vandermondeResult.executionTime,
        converged: vandermondeResult.converged,
        polynomial: vandermondeResult.polynomial,
        error: vandermondeResult.error,
      })

      // Run Newton Interpolant
      const newtonData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const newtonResult = solveNewtonInterpolant(newtonData)
      comparisonResults.push({
        method: 'Newton Interpolante',
        result: newtonResult,
        executionTime: newtonResult.executionTime,
        converged: newtonResult.converged,
        polynomial: newtonResult.polynomial,
        error: newtonResult.error,
      })

      // Run Lagrange
      const lagrangeData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const lagrangeResult = solveLagrange(lagrangeData)
      comparisonResults.push({
        method: 'Lagrange',
        result: lagrangeResult,
        executionTime: lagrangeResult.executionTime,
        converged: lagrangeResult.converged,
        polynomial: lagrangeResult.polynomial,
        error: lagrangeResult.error,
      })

      // Run Linear Spline
      const splineLinearData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const splineLinearResult = solveSplineLinear(splineLinearData)
      comparisonResults.push({
        method: 'Spline Lineal',
        result: splineLinearResult,
        executionTime: splineLinearResult.executionTime,
        converged: splineLinearResult.converged,
        polynomial: splineLinearResult.polynomial,
        error: splineLinearResult.error,
      })

      // Run Cubic Spline (only if we have at least 3 points)
      if (dataPoints.length >= 3) {
        const splineCubicData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
        const splineCubicResult = solveSplineCubic(splineCubicData)
        comparisonResults.push({
          method: 'Spline Cúbica',
          result: splineCubicResult,
          executionTime: splineCubicResult.executionTime,
          converged: splineCubicResult.converged,
          polynomial: splineCubicResult.polynomial,
          error: splineCubicResult.error,
        })
      }

      setResults(comparisonResults)

      // Determine best method (fastest among converged methods)
      const convergedMethods = comparisonResults.filter((r) => r.converged)
      if (convergedMethods.length > 0) {
        const fastest = convergedMethods.reduce((prev, current) =>
          prev.executionTime < current.executionTime ? prev : current
        )
        setBestMethod(fastest.method)
      }
    } catch (error) {
      console.error('Error en comparación de interpolación:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) return

    const lines = [
      'Comparación de Métodos de Interpolación - Resultados',
      '',
      'Configuración:',
      `Puntos de datos:,${dataPoints.length}`,
      `Mejor método:,${bestMethod}`,
      '',
      'Puntos de entrada:',
      'x,y',
      ...dataPoints.map((p) => `${p.x},${p.y}`),
      '',
      'Resultados por método:',
      'Método,Estado,Tiempo (ms),Polinomio,Error',
      ...results.map(
        (r) =>
          `"${r.method}",${r.converged ? 'Éxito' : 'Error'},${r.executionTime.toFixed(3)},"${r.polynomial}","${r.error || ''}"`
      ),
    ]

    const csvContent = lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `interpolation_comparison_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatTime = (time: number) => time.toFixed(3)

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>
          Comparación de Métodos de Interpolación
        </h1>
        <p className='text-muted-foreground'>
          Ejecuta y compara todos los métodos de interpolación con los mismos
          datos para identificar el método más eficiente y adecuado.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Input Panel */}
        <div className='space-y-4 lg:col-span-1'>
          <DataPointsInput
            onDataChange={setDataPoints}
            maxPoints={8}
            minPoints={2}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ejecutar Comparación</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-muted-foreground text-sm'>
                <p>Se ejecutarán todos los métodos disponibles:</p>
                <ul className='mt-2 space-y-1'>
                  <li>• Vandermonde</li>
                  <li>• Newton Interpolante</li>
                  <li>• Lagrange</li>
                  <li>• Spline Lineal</li>
                  {dataPoints.length >= 3 && <li>• Spline Cúbica</li>}
                </ul>
              </div>

              <Button
                onClick={runComparison}
                disabled={isCalculating || dataPoints.length < 2}
                className='w-full'
              >
                {isCalculating ? (
                  <>
                    <Clock className='mr-2 h-4 w-4 animate-spin' />
                    Comparando...
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Ejecutar Comparación
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className='space-y-6 lg:col-span-2'>
          {results.length > 0 && (
            <>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5' />
                    Resumen de Comparación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='mb-4 grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium'>Métodos ejecutados:</span>
                      <span className='ml-2'>{results.length}</span>
                    </div>
                    <div>
                      <span className='font-medium'>Métodos exitosos:</span>
                      <span className='ml-2'>
                        {results.filter((r) => r.converged).length}
                      </span>
                    </div>
                    <div>
                      <span className='font-medium'>Mejor método:</span>
                      <span className='ml-2 font-medium text-green-600'>
                        {bestMethod || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className='font-medium'>Puntos procesados:</span>
                      <span className='ml-2'>{dataPoints.length}</span>
                    </div>
                  </div>

                  <Button onClick={exportToCSV} variant='outline' size='sm'>
                    <Download className='mr-2 h-4 w-4' />
                    Exportar Comparación
                  </Button>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Tabs defaultValue='comparison' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='comparison'>Comparación</TabsTrigger>
                  <TabsTrigger value='polynomials'>Polinomios</TabsTrigger>
                </TabsList>

                <TabsContent value='comparison' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparación de Métodos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='overflow-x-auto'>
                        <table className='w-full border-collapse'>
                          <thead>
                            <tr className='border-b'>
                              <th className='p-3 text-left'>Método</th>
                              <th className='p-3 text-left'>Estado</th>
                              <th className='p-3 text-left'>Tiempo (ms)</th>
                              <th className='p-3 text-left'>Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((result, index) => (
                              <tr key={index} className='border-b'>
                                <td className='p-3 font-medium'>
                                  {result.method}
                                  {result.method === bestMethod && (
                                    <Badge className='ml-2 bg-green-100 text-green-800'>
                                      Mejor
                                    </Badge>
                                  )}
                                </td>
                                <td className='p-3'>
                                  {result.converged ? (
                                    <Badge className='bg-green-100 text-green-800'>
                                      <CheckCircle className='mr-1 h-3 w-3' />
                                      Éxito
                                    </Badge>
                                  ) : (
                                    <Badge variant='destructive'>
                                      <XCircle className='mr-1 h-3 w-3' />
                                      Error
                                    </Badge>
                                  )}
                                </td>
                                <td className='p-3 font-mono'>
                                  {formatTime(result.executionTime)}
                                </td>
                                <td className='text-muted-foreground p-3 text-sm'>
                                  {result.error ||
                                    (result.converged
                                      ? 'Interpolación exitosa'
                                      : 'Error en cálculo')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='polynomials' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Polinomios Resultantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {results
                          .filter((r) => r.converged)
                          .map((result, index) => (
                            <div
                              key={index}
                              className='border-l-4 border-blue-200 pl-4'
                            >
                              <div className='mb-2 text-sm font-medium'>
                                {result.method}
                                {result.method === bestMethod && (
                                  <Badge className='ml-2 bg-green-100 text-xs text-green-800'>
                                    Mejor
                                  </Badge>
                                )}
                              </div>
                              <div className='bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm'>
                                {result.polynomial}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Analysis Report */}
              {bestMethod && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis Automático</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2 text-sm'>
                      <p>
                        <strong>Método Recomendado:</strong> {bestMethod}
                      </p>
                      <p>
                        <strong>Criterio:</strong> Mejor tiempo de ejecución
                        entre métodos exitosos
                      </p>
                      <p className='text-muted-foreground mt-4'>
                        Todos los métodos de interpolación polinómica
                        (Vandermonde, Newton, Lagrange) deberían producir el
                        mismo polinomio para los mismos puntos de datos. Los
                        splines ofrecen interpolación por tramos que puede ser
                        más adecuada para conjuntos de datos grandes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Placeholder when no results */}
          {results.length === 0 && (
            <Card>
              <CardContent className='py-12'>
                <div className='text-muted-foreground text-center'>
                  <Play className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <h3 className='mb-2 text-lg font-medium'>
                    Listo para Comparar
                  </h3>
                  <p>
                    Ingrese los puntos de datos y presione "Ejecutar
                    Comparación" para ver los resultados.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Information about Interpolation Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Acerca de los Métodos de Interpolación</CardTitle>
        </CardHeader>
        <CardContent className='prose prose-sm max-w-none'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div>
              <h4 className='mb-2 font-medium'>Métodos Polinómicos:</h4>
              <ul className='space-y-1 text-sm'>
                <li>
                  • <strong>Vandermonde:</strong> Directo pero numéricamente
                  inestable
                </li>
                <li>
                  • <strong>Newton:</strong> Eficiente para agregar puntos
                </li>
                <li>
                  • <strong>Lagrange:</strong> Forma explícita elegante
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>Métodos Spline:</h4>
              <ul className='space-y-1 text-sm'>
                <li>
                  • <strong>Lineal:</strong> Simple, no oscila
                </li>
                <li>
                  • <strong>Cúbica:</strong> Suave, derivadas continuas
                </li>
                <li>
                  • <strong>Mejor para:</strong> Muchos puntos de datos
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Play, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import {
  solveSplineCubic,
  type SplineCubicResult,
  generateSplineCubicPoints,
  evaluateSplineCubic,
  verifySplineSmoothness,
} from '@/utils/algorithms/spline-cubic'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataPointsInput, {
  type DataPoint,
} from '@/features/methods/common/data-points-input'

export default function SplineCubicMethod() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: 2, y: 9 },
    { x: 3, y: 16 },
  ])
  const [result, setResult] = useState<SplineCubicResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (dataPoints.length < 3) return

    setIsCalculating(true)

    // Pequeña pausa para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const splineData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const calculationResult = solveSplineCubic(splineData)
      setResult(calculationResult)
    } catch (error) {
      console.error('Error en cálculo de Spline Cúbica:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const exportToCSV = () => {
    if (!result) return

    const lines = [
      'Método de Spline Cúbica - Resultados',
      '',
      'Configuración:',
      `Puntos de datos:,${dataPoints.length}`,
      `Estado:,${result.converged ? 'Éxito' : 'Error'}`,
      `Tiempo de ejecución:,${result.executionTime.toFixed(3)} ms`,
      `Segmentos:,${result.segments.length}`,
      '',
      'Puntos de entrada:',
      'x,y',
      ...dataPoints.map((p) => `${p.x},${p.y}`),
      '',
      'Segundas derivadas:',
      'Punto,Valor',
      ...result.secondDerivatives.map((deriv, i) => `x_${i},${deriv}`),
      '',
      'Segmentos del spline:',
      'Intervalo,Ecuación,Coeficientes',
      ...result.segments.map(
        (seg) =>
          `"[${seg.interval[0]}, ${seg.interval[1]}]","${seg.equation}","[${seg.coefficients.join(', ')}]"`
      ),
      '',
      'Definición completa:',
      result.polynomial,
      '',
      'Tabla de iteraciones:',
      'Paso,Descripción,Operación',
      ...result.iterations.map(
        (iter) => `${iter.step},"${iter.description}","${iter.operation}"`
      ),
    ]

    const csvContent = lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `spline_cubic_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 1e-12) return '0'
    if (Number.isInteger(num)) return num.toString()
    return parseFloat(num.toFixed(6)).toString()
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>Spline Cúbica</h1>
        <p className='text-muted-foreground'>
          Interpolación suave usando polinomios cúbicos por tramos con
          condiciones de frontera naturales. Garantiza continuidad de la función
          y sus primeras dos derivadas.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Input Panel */}
        <div className='space-y-4 lg:col-span-1'>
          <DataPointsInput
            onDataChange={setDataPoints}
            maxPoints={8}
            minPoints={3}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ejecutar Método</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating || dataPoints.length < 3}
                className='w-full'
              >
                {isCalculating ? (
                  <>
                    <Clock className='mr-2 h-4 w-4 animate-spin' />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Calcular Spline Cúbica
                  </>
                )}
              </Button>

              {dataPoints.length < 3 && (
                <Alert className='mt-2'>
                  <AlertDescription>
                    Se necesitan al menos 3 puntos para spline cúbica
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className='space-y-6 lg:col-span-2'>
          {result && (
            <>
              {/* Status and Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Resultado
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.converged ? (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='font-medium'>
                            Puntos procesados:
                          </span>
                          <span className='ml-2'>{dataPoints.length}</span>
                        </div>
                        <div>
                          <span className='font-medium'>
                            Tiempo de ejecución:
                          </span>
                          <span className='ml-2'>
                            {result.executionTime.toFixed(3)} ms
                          </span>
                        </div>
                        <div>
                          <span className='font-medium'>
                            Segmentos cúbicos:
                          </span>
                          <span className='ml-2'>{result.segments.length}</span>
                        </div>
                        <div>
                          <span className='font-medium'>Suavidad:</span>
                          <span className='ml-2'>
                            {(() => {
                              const smoothness = verifySplineSmoothness(
                                result.segments
                              )
                              return smoothness.continuous &&
                                smoothness.firstDerivativeContinuous
                                ? 'C¹ continua'
                                : 'Verificar continuidad'
                            })()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>
                          Spline Cúbica por Tramos:
                        </h4>
                        <div className='bg-muted rounded-md p-3 font-mono text-xs whitespace-pre-line'>
                          {result.polynomial}
                        </div>
                      </div>

                      <Button onClick={exportToCSV} variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Exportar CSV
                      </Button>
                    </div>
                  ) : (
                    <Alert variant='destructive'>
                      <AlertDescription>
                        {result.error ||
                          'Error en el cálculo de la spline cúbica'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Results */}
              {result.converged && (
                <Tabs defaultValue='segments' className='w-full'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='segments'>Segmentos</TabsTrigger>
                    <TabsTrigger value='derivatives'>Derivadas</TabsTrigger>
                    <TabsTrigger value='iterations'>Proceso</TabsTrigger>
                    <TabsTrigger value='verification'>Verificación</TabsTrigger>
                  </TabsList>

                  <TabsContent value='segments' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Segmentos Cúbicos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='border-b'>
                                <th className='p-2 text-left'>Segmento</th>
                                <th className='p-2 text-left'>Intervalo</th>
                                <th className='p-2 text-left'>Ecuación</th>
                                <th className='p-2 text-left'>Puntos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.segments.map((segment, index) => (
                                <tr key={index} className='border-b'>
                                  <td className='p-2 font-mono'>
                                    S_{index + 1}
                                  </td>
                                  <td className='p-2 font-mono'>
                                    [{formatNumber(segment.interval[0])},{' '}
                                    {formatNumber(segment.interval[1])}]
                                  </td>
                                  <td className='p-2 font-mono text-xs'>
                                    {segment.equation}
                                  </td>
                                  <td className='p-2 text-xs'>
                                    ({formatNumber(segment.startPoint.x)},{' '}
                                    {formatNumber(segment.startPoint.y)}) → (
                                    {formatNumber(segment.endPoint.x)},{' '}
                                    {formatNumber(segment.endPoint.y)})
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='derivatives' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Segundas Derivadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='border-b'>
                                <th className='p-2 text-left'>Punto</th>
                                <th className='p-2 text-left'>x</th>
                                <th className='p-2 text-left'>S''(x)</th>
                                <th className='p-2 text-left'>Condición</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.secondDerivatives.map((deriv, index) => (
                                <tr key={index} className='border-b'>
                                  <td className='p-2 font-mono'>x_{index}</td>
                                  <td className='p-2 font-mono'>
                                    {formatNumber(dataPoints[index]?.x || 0)}
                                  </td>
                                  <td className='p-2 font-mono'>
                                    {formatNumber(deriv)}
                                  </td>
                                  <td className='p-2 text-xs'>
                                    {index === 0 ||
                                    index ===
                                      result.secondDerivatives.length - 1
                                      ? "Frontera natural (S'' = 0)"
                                      : "Continuidad S''"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='iterations' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Proceso de Construcción</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='max-h-96 space-y-4 overflow-y-auto'>
                          {result.iterations.map((iteration, index) => (
                            <div
                              key={index}
                              className='border-l-2 border-blue-200 pl-4'
                            >
                              <div className='text-sm font-medium'>
                                Paso {iteration.step}: {iteration.description}
                              </div>
                              <div className='text-muted-foreground mt-1 text-sm'>
                                {iteration.operation}
                              </div>
                              {iteration.matrix && (
                                <div className='mt-2 text-xs'>
                                  <div className='font-medium'>
                                    Sistema tridiagonal:
                                  </div>
                                  <div className='bg-muted max-w-full overflow-x-auto rounded p-2 font-mono'>
                                    {iteration.matrix
                                      .slice(0, 3)
                                      .map((row, i) => (
                                        <div key={i}>
                                          [
                                          {row
                                            .map((val) => formatNumber(val))
                                            .join(', ')}
                                          ]
                                          {iteration.matrix!.length > 3 &&
                                            i === 2 &&
                                            '...'}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {iteration.segment && (
                                <div className='mt-2 text-xs'>
                                  <div className='font-medium'>
                                    Segmento: {iteration.segment.equation}
                                  </div>
                                  <div className='bg-muted rounded p-2 font-mono'>
                                    Coeficientes: [
                                    {iteration.segment.coefficients
                                      .map((c) => formatNumber(c))
                                      .join(', ')}
                                    ]
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='verification' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Verificación de Resultados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <div>
                            <h4 className='mb-2 font-medium'>
                              Evaluación en Puntos Originales:
                            </h4>
                            <div className='overflow-x-auto'>
                              <table className='w-full border-collapse'>
                                <thead>
                                  <tr className='border-b'>
                                    <th className='p-2 text-left'>x</th>
                                    <th className='p-2 text-left'>
                                      y original
                                    </th>
                                    <th className='p-2 text-left'>
                                      S(x) calculado
                                    </th>
                                    <th className='p-2 text-left'>Error</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dataPoints.map((point, index) => {
                                    const calculated = evaluateSplineCubic(
                                      result.segments,
                                      point.x
                                    )
                                    const error = Math.abs(calculated - point.y)
                                    return (
                                      <tr key={index} className='border-b'>
                                        <td className='p-2 font-mono'>
                                          {formatNumber(point.x)}
                                        </td>
                                        <td className='p-2 font-mono'>
                                          {formatNumber(point.y)}
                                        </td>
                                        <td className='p-2 font-mono'>
                                          {formatNumber(calculated)}
                                        </td>
                                        <td className='p-2 font-mono'>
                                          {formatNumber(error)}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className='text-muted-foreground text-sm'>
                            <p>
                              <strong>Nota:</strong> La spline cúbica garantiza
                              interpolación exacta en todos los puntos dados.
                            </p>
                            <p>
                              Los errores mostrados deben ser prácticamente cero
                              (≈ 10⁻¹⁵) debido a la precisión de punto flotante.
                            </p>
                            <p>
                              <strong>Propiedades de Suavidad:</strong>{' '}
                              {(() => {
                                const smoothness = verifySplineSmoothness(
                                  result.segments
                                )
                                const parts = []
                                if (smoothness.continuous)
                                  parts.push('Continua (C⁰)')
                                if (smoothness.firstDerivativeContinuous)
                                  parts.push('Primera derivada continua (C¹)')
                                if (smoothness.secondDerivativeContinuous)
                                  parts.push('Segunda derivada continua (C²)')
                                return (
                                  parts.join(', ') || 'Verificar continuidad'
                                )
                              })()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}

          {/* Placeholder when no result */}
          {!result && (
            <Card>
              <CardContent className='py-12'>
                <div className='text-muted-foreground text-center'>
                  <Play className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <h3 className='mb-2 text-lg font-medium'>
                    Listo para Calcular
                  </h3>
                  <p>
                    Ingrese al menos 3 puntos de datos y presione "Calcular
                    Spline Cúbica" para ver los resultados.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Algorithm Information */}
      <Card>
        <CardHeader>
          <CardTitle>Acerca de la Spline Cúbica</CardTitle>
        </CardHeader>
        <CardContent className='prose prose-sm max-w-none'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div>
              <h4 className='mb-2 font-medium'>Características:</h4>
              <ul className='space-y-1 text-sm'>
                <li>• Polinomios cúbicos por tramos</li>
                <li>• Continuidad C² (función y primeras dos derivadas)</li>
                <li>• Condiciones de frontera naturales</li>
                <li>• Interpolación suave sin oscilaciones</li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>Ventajas y Limitaciones:</h4>
              <ul className='space-y-1 text-sm'>
                <li>
                  • <span className='text-green-600'>✓</span> Máxima suavidad
                  entre métodos de interpolación
                </li>
                <li>
                  • <span className='text-green-600'>✓</span> Estable
                  numéricamente
                </li>
                <li>
                  • <span className='text-red-600'>✗</span> Requiere al menos 3
                  puntos
                </li>
                <li>
                  • <span className='text-red-600'>✗</span> Más complejo
                  computacionalmente
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

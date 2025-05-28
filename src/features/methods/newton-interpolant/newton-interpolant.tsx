import { useState } from 'react'
import { Play, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import {
  solveNewtonInterpolant,
  type NewtonInterpolantResult,
  generateNewtonPoints,
  evaluateNewtonPolynomial,
  newtonToStandardForm,
} from '@/utils/algorithms/newton-interpolant'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataPointsInput, {
  type DataPoint,
} from '@/features/methods/common/data-points-input'

export default function NewtonInterpolantMethod() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: 2, y: 9 },
  ])
  const [result, setResult] = useState<NewtonInterpolantResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (dataPoints.length < 2) return

    setIsCalculating(true)

    // Pequeña pausa para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const newtonData = dataPoints.map((p) => ({ x: p.x, y: p.y }))
      const calculationResult = solveNewtonInterpolant(newtonData)
      setResult(calculationResult)
    } catch (error) {
      console.error('Error en cálculo de Newton Interpolante:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const exportToCSV = () => {
    if (!result) return

    const lines = [
      'Método de Newton Interpolante - Resultados',
      '',
      'Configuración:',
      `Puntos de datos:,${dataPoints.length}`,
      `Estado:,${result.converged ? 'Éxito' : 'Error'}`,
      `Tiempo de ejecución:,${result.executionTime.toFixed(3)} ms`,
      '',
      'Puntos de entrada:',
      'x,y',
      ...dataPoints.map((p) => `${p.x},${p.y}`),
      '',
      'Coeficientes de Newton:',
      'Índice,Coeficiente',
      ...result.coefficients.map((coeff, i) => `${i},${coeff}`),
      '',
      'Polinomio de Newton:',
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
    link.download = `newton_interpolant_${new Date().toISOString().split('T')[0]}.csv`
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
        <h1 className='text-3xl font-bold'>Método de Newton Interpolante</h1>
        <p className='text-muted-foreground'>
          Construye el polinomio interpolante utilizando diferencias divididas.
          Eficiente para agregar nuevos puntos y ideal para análisis
          incremental.
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
              <CardTitle>Ejecutar Método</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating || dataPoints.length < 2}
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
                    Calcular Newton
                  </>
                )}
              </Button>
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
                            Grado del polinomio:
                          </span>
                          <span className='ml-2'>
                            {result.coefficients.length - 1}
                          </span>
                        </div>
                        <div>
                          <span className='font-medium'>Coeficientes:</span>
                          <span className='ml-2'>
                            {result.coefficients.length}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium'>
                          Polinomio de Newton:
                        </h4>
                        <div className='bg-muted rounded-md p-3 font-mono text-sm'>
                          P(x) = {result.polynomial}
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
                          'Error en el cálculo del método de Newton Interpolante'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Results */}
              {result.converged && (
                <Tabs defaultValue='differences' className='w-full'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='differences'>Diferencias</TabsTrigger>
                    <TabsTrigger value='coefficients'>Coeficientes</TabsTrigger>
                    <TabsTrigger value='iterations'>Proceso</TabsTrigger>
                    <TabsTrigger value='verification'>Verificación</TabsTrigger>
                  </TabsList>

                  <TabsContent value='differences' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tabla de Diferencias Divididas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='border-b'>
                                <th className='p-2 text-left'>Punto</th>
                                {result.dividedDifferences.map((_, order) => (
                                  <th key={order} className='p-2 text-left'>
                                    Orden {order}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dataPoints.map((point, i) => (
                                <tr key={i} className='border-b'>
                                  <td className='p-2 font-mono'>
                                    x_{i} = {formatNumber(point.x)}
                                  </td>
                                  {result.dividedDifferences.map(
                                    (col, order) => (
                                      <td key={order} className='p-2 font-mono'>
                                        {col[i] !== undefined
                                          ? formatNumber(col[i])
                                          : '-'}
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='coefficients' className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Coeficientes de Newton</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='border-b'>
                                <th className='p-2 text-left'>Índice</th>
                                <th className='p-2 text-left'>Término</th>
                                <th className='p-2 text-left'>Coeficiente</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.coefficients.map((coeff, index) => (
                                <tr key={index} className='border-b'>
                                  <td className='p-2 font-mono'>{index}</td>
                                  <td className='p-2 font-mono'>
                                    {index === 0
                                      ? 'Constante'
                                      : `∏(x - x_j) j=0..${index - 1}`}
                                  </td>
                                  <td className='p-2 font-mono'>
                                    {formatNumber(coeff)}
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
                              {iteration.table && (
                                <div className='mt-2 text-xs'>
                                  <div className='font-medium'>Valores:</div>
                                  <div className='bg-muted max-w-full overflow-x-auto rounded p-2 font-mono'>
                                    [
                                    {iteration.table
                                      .map((val) => formatNumber(val))
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
                                      P(x) calculado
                                    </th>
                                    <th className='p-2 text-left'>Error</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dataPoints.map((point, index) => {
                                    const xData = dataPoints.map((p) => p.x)
                                    const calculated = evaluateNewtonPolynomial(
                                      result.coefficients,
                                      xData,
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
                              <strong>Nota:</strong> El método de Newton
                              garantiza interpolación exacta en todos los puntos
                              dados.
                            </p>
                            <p>
                              Los errores mostrados deben ser prácticamente cero
                              (≈ 10⁻¹⁵) debido a la precisión de punto flotante.
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
                    Ingrese los puntos de datos y presione "Calcular Newton"
                    para ver los resultados.
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
          <CardTitle>Acerca del Método de Newton Interpolante</CardTitle>
        </CardHeader>
        <CardContent className='prose prose-sm max-w-none'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div>
              <h4 className='mb-2 font-medium'>Características:</h4>
              <ul className='space-y-1 text-sm'>
                <li>• Utiliza diferencias divididas sucesivas</li>
                <li>• Forma incremental: fácil agregar puntos</li>
                <li>• Coeficientes de la diagonal principal</li>
                <li>• Estructura recursiva eficiente</li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>Ventajas y Limitaciones:</h4>
              <ul className='space-y-1 text-sm'>
                <li>
                  • <span className='text-green-600'>✓</span> Eficiente para
                  agregar nuevos puntos
                </li>
                <li>
                  • <span className='text-green-600'>✓</span> Estable
                  numéricamente
                </li>
                <li>
                  • <span className='text-red-600'>✗</span> Requiere orden de
                  los puntos
                </li>
                <li>
                  • <span className='text-red-600'>✗</span> Sensible a
                  espaciamiento irregular
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

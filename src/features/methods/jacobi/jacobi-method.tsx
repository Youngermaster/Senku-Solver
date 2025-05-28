import { useState } from 'react'
import { Loader2, Play, Download } from 'lucide-react'
import {
  jacobi,
  type JacobiParams,
  type JacobiResult,
} from '@/utils/algorithms/jacobi'
import { estimateOptimalOmega } from '@/utils/matrix-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import MatrixInput from '../common/matrix-input'
import JacobiTable from './jacobi-table'

// Default example for quick testing
const defaultMatrix = [
  [4, -1, 0],
  [-1, 4, -1],
  [0, -1, 4],
]

const defaultVector = [3, 7, 6]

const defaultInitialGuess = [0, 0, 0]

export default function JacobiMethod() {
  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix)
  const [vector, setVector] = useState<number[]>(defaultVector)
  const [initialGuess, setInitialGuess] =
    useState<number[]>(defaultInitialGuess)
  const [tolerance, setTolerance] = useState('1e-7')
  const [maxIterations, setMaxIterations] = useState('100')
  const [result, setResult] = useState<JacobiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSolve = async () => {
    if (matrix.length === 0) {
      setError('Por favor configura el sistema de ecuaciones primero')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params: JacobiParams = {
        matrix,
        vector,
        initialGuess,
        tolerance: parseFloat(tolerance),
        maxIterations: parseInt(maxIterations),
      }

      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 100))

      const jacobiResult = jacobi(params)
      setResult(jacobiResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el cálculo')
    } finally {
      setLoading(false)
    }
  }

  const exportResults = () => {
    if (!result) return

    const csvContent = [
      'Iteración,Variable 1,Variable 2,Variable 3,Error,Error Relativo',
      ...result.iterations.map(
        (iter) =>
          `${iter.iteration},${iter.x.map((x) => x.toFixed(8)).join(',')},${iter.error.toFixed(8)},${iter.relativeError.toFixed(8)}`
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jacobi_resultados.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Método de Jacobi</h1>
        <p className='text-muted-foreground mt-2'>
          Método iterativo para resolver sistemas de ecuaciones lineales Ax = b
        </p>
      </div>

      {/* Matrix Input */}
      <MatrixInput
        onMatrixChange={setMatrix}
        onVectorChange={setVector}
        onInitialGuessChange={setInitialGuess}
        matrix={matrix}
        vector={vector}
        initialGuess={initialGuess}
      />

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros del Método</CardTitle>
          <CardDescription>
            Configura los parámetros de convergencia para el método de Jacobi
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
              <Label htmlFor='max-iterations'>Máximo de Iteraciones</Label>
              <Input
                id='max-iterations'
                type='number'
                value={maxIterations}
                onChange={(e) => setMaxIterations(e.target.value)}
                placeholder='100'
              />
            </div>
          </div>

          <Button
            onClick={handleSolve}
            disabled={loading || matrix.length === 0}
            className='w-full'
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Play className='mr-2 h-4 w-4' />
            Resolver con Jacobi
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className='space-y-6'>
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Resultados del Método de Jacobi</CardTitle>
                <Button onClick={exportResults} variant='outline' size='sm'>
                  <Download className='mr-2 h-4 w-4' />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Estado
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.converged ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.converged ? '✅ Convergió' : '❌ No convergió'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Iteraciones
                  </p>
                  <p className='text-lg font-semibold'>
                    {result.totalIterations}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Radio Espectral
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.spectralRadius < 1
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {result.spectralRadius.toFixed(6)}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Tiempo (ms)
                  </p>
                  <p className='text-lg font-semibold'>
                    {result.executionTime.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className='mt-6 space-y-4'>
                <div>
                  <p className='text-muted-foreground mb-2 text-sm font-medium'>
                    Solución Final
                  </p>
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                      {result.solution.map((value, index) => (
                        <div key={index} className='text-sm'>
                          <span className='font-medium'>x_{index + 1} = </span>
                          <span className='font-mono'>{value.toFixed(8)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className='text-muted-foreground mb-2 text-sm font-medium'>
                    Análisis de Convergencia
                  </p>
                  <div className='space-y-2 rounded-lg bg-gray-50 p-4'>
                    <p
                      className={`text-sm ${result.canConverge ? 'text-green-700' : 'text-red-700'}`}
                    >
                      <strong>Predicción teórica:</strong>{' '}
                      {result.canConverge
                        ? 'El método debería converger (ρ < 1)'
                        : 'El método podría no converger (ρ ≥ 1)'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      <strong>Error final:</strong>{' '}
                      {result.finalError.toExponential(3)}
                    </p>
                    {!result.canConverge && (
                      <p className='text-sm text-yellow-700'>
                        ⚠️ Considera usar un método directo o reordenar la
                        matriz para mejorar la dominancia diagonal
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iterations Table */}
          <JacobiTable iterations={result.iterations} />
        </div>
      )}
    </div>
  )
}

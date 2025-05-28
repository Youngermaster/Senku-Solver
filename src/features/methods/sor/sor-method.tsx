import { useState, useEffect } from 'react'
import { Loader2, Play, Download, Lightbulb } from 'lucide-react'
import { sor, type SORParams, type SORResult } from '@/utils/algorithms/sor'
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
import SORTable from './sor-table'

// Default example for quick testing
const defaultMatrix = [
  [4, -1, 0],
  [-1, 4, -1],
  [0, -1, 4],
]

const defaultVector = [3, 7, 6]

const defaultInitialGuess = [0, 0, 0]

export default function SORMethod() {
  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix)
  const [vector, setVector] = useState<number[]>(defaultVector)
  const [initialGuess, setInitialGuess] =
    useState<number[]>(defaultInitialGuess)
  const [tolerance, setTolerance] = useState('1e-7')
  const [maxIterations, setMaxIterations] = useState('100')
  const [relaxationFactor, setRelaxationFactor] = useState('1.2')
  const [estimatedOmega, setEstimatedOmega] = useState<number | null>(null)
  const [result, setResult] = useState<SORResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-estimate omega when matrix changes (including initial load)
  useEffect(() => {
    if (matrix.length > 0) {
      const estimated = estimateOptimalOmega(matrix)
      setEstimatedOmega(estimated)
    }
  }, [matrix])

  const handleSolve = async () => {
    if (matrix.length === 0) {
      setError('Por favor configura el sistema de ecuaciones primero')
      return
    }

    const omega = parseFloat(relaxationFactor)
    if (omega <= 0 || omega >= 2) {
      setError('El factor de relajación (ω) debe estar entre 0 y 2')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params: SORParams = {
        matrix,
        vector,
        initialGuess,
        tolerance: parseFloat(tolerance),
        maxIterations: parseInt(maxIterations),
        relaxationFactor: omega,
      }

      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 100))

      const sorResult = sor(params)
      setResult(sorResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el cálculo')
    } finally {
      setLoading(false)
    }
  }

  const useEstimatedOmega = () => {
    if (estimatedOmega !== null) {
      setRelaxationFactor(estimatedOmega.toFixed(3))
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
    a.download = 'sor_resultados.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Método SOR</h1>
        <p className='text-muted-foreground mt-2'>
          Successive Over-Relaxation - Método iterativo con factor de relajación
          para acelerar convergencia
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
            Configura los parámetros de convergencia y el factor de relajación
            (ω) para SOR
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
            <div>
              <Label htmlFor='relaxation-factor'>
                Factor de Relajación (ω)
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='relaxation-factor'
                  type='number'
                  step='0.001'
                  min='0.001'
                  max='1.999'
                  value={relaxationFactor}
                  onChange={(e) => setRelaxationFactor(e.target.value)}
                  placeholder='1.2'
                />
                {estimatedOmega !== null && (
                  <Button
                    onClick={useEstimatedOmega}
                    variant='outline'
                    size='sm'
                    className='whitespace-nowrap'
                  >
                    Usar {estimatedOmega.toFixed(3)}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Omega Information */}
          {estimatedOmega !== null && (
            <Alert>
              <Lightbulb className='h-4 w-4' />
              <AlertDescription>
                <strong>Estimación automática:</strong> ω ≈{' '}
                {estimatedOmega.toFixed(3)} para convergencia óptima. Para SOR:
                ω = 1 (Gauss-Seidel), ω &lt; 1 (sub-relajación), ω &gt; 1
                (sobre-relajación).
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSolve}
            disabled={loading || matrix.length === 0}
            className='w-full'
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Play className='mr-2 h-4 w-4' />
            Resolver con SOR
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
                <CardTitle>Resultados del Método SOR</CardTitle>
                <Button onClick={exportResults} variant='outline' size='sm'>
                  <Download className='mr-2 h-4 w-4' />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
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
                    Factor ω
                  </p>
                  <p className='text-lg font-semibold'>
                    {result.relaxationFactor.toFixed(3)}
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
                    <p className='text-sm text-blue-700'>
                      🚀 SOR con ω óptimo puede converger hasta 2x más rápido
                      que Gauss-Seidel
                    </p>
                    {result.relaxationFactor > 1 && (
                      <p className='text-sm text-purple-700'>
                        📈 Sobre-relajación activa (ω &gt; 1) para acelerar
                        convergencia
                      </p>
                    )}
                    {!result.canConverge && (
                      <p className='text-sm text-yellow-700'>
                        ⚠️ Considera ajustar ω o usar un método directo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iterations Table */}
          <SORTable iterations={result.iterations} />
        </div>
      )}
    </div>
  )
}

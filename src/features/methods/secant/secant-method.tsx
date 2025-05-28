import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import {
  secantMethod,
  type SecantParams,
  type SecantResult,
  defaultFunction,
} from '@/utils/algorithms/secant'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import SecantTable from '@/features/methods/secant/secant-table'

export default function SecantMethod() {
  const [params, setParams] = useState<SecantParams>({
    x0: 0,
    x1: 1,
    tolerance: 0.0001,
    maxIterations: 100,
    functionExpression: defaultFunction,
  })

  const [result, setResult] = useState<SecantResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (
    field: keyof SecantParams,
    value: string | number
  ) => {
    setParams((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    try {
      const calculationResult = secantMethod(params)
      setResult(calculationResult)
    } catch (error) {
      console.error('Error in calculation:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setParams({
      x0: 0,
      x1: 1,
      tolerance: 0.0001,
      maxIterations: 100,
      functionExpression: defaultFunction,
    })
    setResult(null)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Calculator className='text-primary h-8 w-8' />
        <div>
          <h2 className='text-2xl font-bold'>Método de la Secante</h2>
          <p className='text-muted-foreground'>
            Encuentra raíces usando dos puntos iniciales sin calcular derivadas
          </p>
        </div>
      </div>

      {/* Information Alert */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          El método de la secante es similar a Newton-Raphson pero no requiere
          calcular la derivada. Usa dos puntos iniciales para aproximar la
          pendiente de la secante.
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Input Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Entrada</CardTitle>
            <CardDescription>
              Configura los valores iniciales para el método de la secante
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='function'>Función f(x)</Label>
              <Textarea
                id='function'
                placeholder='Ejemplo: log(sin(x)**2 + 1) - 1/2'
                value={params.functionExpression}
                onChange={(e) =>
                  handleInputChange('functionExpression', e.target.value)
                }
                className='font-mono'
                rows={3}
              />
              <p className='text-muted-foreground text-xs'>
                Usa sin, cos, exp, log, sqrt, etc. para funciones matemáticas
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='x0'>Primer punto (x₀)</Label>
                <Input
                  id='x0'
                  type='number'
                  step='any'
                  value={params.x0}
                  onChange={(e) =>
                    handleInputChange('x0', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='x1'>Segundo punto (x₁)</Label>
                <Input
                  id='x1'
                  type='number'
                  step='any'
                  value={params.x1}
                  onChange={(e) =>
                    handleInputChange('x1', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='tolerance'>Tolerancia</Label>
                <Input
                  id='tolerance'
                  type='number'
                  step='any'
                  value={params.tolerance}
                  onChange={(e) =>
                    handleInputChange(
                      'tolerance',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='maxIterations'>Máx. Iteraciones</Label>
                <Input
                  id='maxIterations'
                  type='number'
                  value={params.maxIterations}
                  onChange={(e) =>
                    handleInputChange(
                      'maxIterations',
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className='flex-1'
              >
                {isCalculating ? 'Calculando...' : 'Calcular'}
              </Button>
              <Button variant='outline' onClick={handleReset}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>
                Resultado del método de la secante
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Badge variant={result.converged ? 'default' : 'destructive'}>
                  {result.converged ? 'Convergió' : 'No convergió'}
                </Badge>
              </div>

              <div className='space-y-3'>
                <div>
                  <Label className='text-sm font-medium'>Raíz aproximada</Label>
                  <p className='font-mono text-lg'>
                    {isNaN(result.root) ? 'N/A' : result.root.toFixed(8)}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium'>Error</Label>
                  <p className='font-mono text-lg'>
                    {isNaN(result.error)
                      ? 'N/A'
                      : result.error.toExponential(4)}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium'>Iteraciones</Label>
                  <p className='font-mono text-lg'>{result.iterations}</p>
                </div>

                <Separator />

                <div>
                  <Label className='text-sm font-medium'>Mensaje</Label>
                  <p className='text-muted-foreground text-sm'>
                    {result.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Iteration Table */}
      {result && result.iterationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Iteraciones</CardTitle>
            <CardDescription>
              Detalle de cada iteración del método de la secante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecantTable data={result.iterationData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

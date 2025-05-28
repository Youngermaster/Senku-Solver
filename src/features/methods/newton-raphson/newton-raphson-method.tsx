import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import {
  newtonRaphsonMethod,
  type NewtonRaphsonParams,
  type NewtonRaphsonResult,
  defaultFunction,
  defaultDerivative,
} from '@/utils/algorithms/newton-raphson'
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
import NewtonRaphsonTable from '@/features/methods/newton-raphson/newton-raphson-table'

export default function NewtonRaphsonMethod() {
  const [params, setParams] = useState<NewtonRaphsonParams>({
    x0: 1,
    tolerance: 0.0001,
    maxIterations: 100,
    functionExpression: defaultFunction,
    derivativeExpression: defaultDerivative,
  })

  const [result, setResult] = useState<NewtonRaphsonResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (
    field: keyof NewtonRaphsonParams,
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
      const calculationResult = newtonRaphsonMethod(params)
      setResult(calculationResult)
    } catch (error) {
      console.error('Error in calculation:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setParams({
      x0: 1,
      tolerance: 0.0001,
      maxIterations: 100,
      functionExpression: defaultFunction,
      derivativeExpression: defaultDerivative,
    })
    setResult(null)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Calculator className='text-primary h-8 w-8' />
        <div>
          <h2 className='text-2xl font-bold'>Método de Newton-Raphson</h2>
          <p className='text-muted-foreground'>
            Encuentra raíces usando la tangente de la función: x₁ = x₀ -
            f(x₀)/f'(x₀)
          </p>
        </div>
      </div>

      {/* Information Alert */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          El método de Newton-Raphson requiere la función f(x) y su derivada
          f'(x). Converge rápidamente pero puede fallar si f'(x) = 0 o si el
          punto inicial está lejos de la raíz.
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Input Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Entrada</CardTitle>
            <CardDescription>
              Configura los valores iniciales para el método de Newton-Raphson
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='function'>Función f(x)</Label>
              <Textarea
                id='function'
                placeholder='Ejemplo: sin(2*x) - (x/3)**3 + 0.1'
                value={params.functionExpression}
                onChange={(e) =>
                  handleInputChange('functionExpression', e.target.value)
                }
                className='font-mono'
                rows={2}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='derivative'>Derivada f'(x)</Label>
              <Textarea
                id='derivative'
                placeholder='Ejemplo: 2*cos(2*x) - (x**2)/3'
                value={params.derivativeExpression}
                onChange={(e) =>
                  handleInputChange('derivativeExpression', e.target.value)
                }
                className='font-mono'
                rows={2}
              />
              <p className='text-muted-foreground text-xs'>
                Asegúrate de que la derivada sea correcta para garantizar
                convergencia
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='x0'>Valor inicial (x₀)</Label>
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
                Resultado del método de Newton-Raphson
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
              Detalle de cada iteración del método de Newton-Raphson
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewtonRaphsonTable data={result.iterationData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

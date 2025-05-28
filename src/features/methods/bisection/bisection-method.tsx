import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import {
  bisectionMethod,
  type BisectionParams,
  type BisectionResult,
  defaultFunction,
} from '@/utils/algorithms/bisection'
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
import BisectionTable from '@/features/methods/bisection/bisection-table'

export default function BisectionMethod() {
  const [params, setParams] = useState<BisectionParams>({
    xi: 0,
    xs: 1,
    tolerance: 0.0001,
    maxIterations: 100,
    functionExpression: defaultFunction,
  })

  const [result, setResult] = useState<BisectionResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (
    field: keyof BisectionParams,
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
      const calculationResult = bisectionMethod(params)
      setResult(calculationResult)
    } catch (error) {
      console.error('Error in calculation:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setParams({
      xi: 0,
      xs: 1,
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
          <h2 className='text-2xl font-bold'>Método de Bisección</h2>
          <p className='text-muted-foreground'>
            Encuentra raíces de funciones mediante la división sucesiva de
            intervalos
          </p>
        </div>
      </div>

      {/* Information Alert */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          El método de bisección requiere que la función cambie de signo en el
          intervalo [xi, xs]. Asegúrate de que f(xi) × f(xs) &lt; 0.
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Input Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Entrada</CardTitle>
            <CardDescription>
              Configura los valores iniciales para el método de bisección
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='function'>Función f(x)</Label>
              <Textarea
                id='function'
                placeholder='Ejemplo: log(sin(x)^2 + 1) - (1/2)'
                value={params.functionExpression}
                onChange={(e) =>
                  handleInputChange('functionExpression', e.target.value)
                }
                className='font-mono'
                rows={3}
              />
              <p className='text-muted-foreground text-xs'>
                Usa Math.sin, Math.cos, Math.exp, Math.log, Math.sqrt, etc. para
                funciones matemáticas
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='xi'>Límite inferior (xi)</Label>
                <Input
                  id='xi'
                  type='number'
                  step='any'
                  value={params.xi}
                  onChange={(e) =>
                    handleInputChange('xi', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='xs'>Límite superior (xs)</Label>
                <Input
                  id='xs'
                  type='number'
                  step='any'
                  value={params.xs}
                  onChange={(e) =>
                    handleInputChange('xs', parseFloat(e.target.value) || 0)
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
                Resultado del método de bisección
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
              Detalle de cada iteración del método de bisección
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BisectionTable data={result.iterationData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

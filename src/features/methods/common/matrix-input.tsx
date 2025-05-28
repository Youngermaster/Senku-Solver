import { useState } from 'react'
import { Info, Lightbulb } from 'lucide-react'
import {
  parseMatrixInput,
  parseVectorInput,
  validateMatrix,
  validateVector,
  generateExampleMatrix,
  formatMatrixDisplay,
  formatVectorDisplay,
  checkDiagonalDominance,
} from '@/utils/matrix-utils'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface MatrixInputProps {
  onMatrixChange: (matrix: number[][]) => void
  onVectorChange: (vector: number[]) => void
  onInitialGuessChange: (initialGuess: number[]) => void
  matrix: number[][]
  vector: number[]
  initialGuess: number[]
}

export default function MatrixInput({
  onMatrixChange,
  onVectorChange,
  onInitialGuessChange,
  matrix,
  vector,
  initialGuess,
}: MatrixInputProps) {
  const [matrixInput, setMatrixInput] = useState('')
  const [vectorInput, setVectorInput] = useState('')
  const [initialGuessInput, setInitialGuessInput] = useState('')
  const [exampleSize, setExampleSize] = useState('3')
  const [inputMode, setInputMode] = useState<'text' | 'grid'>('text')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dominanceInfo, setDominanceInfo] = useState<{
    isDiagonallyDominant: boolean
    violations: string[]
  }>({ isDiagonallyDominant: true, violations: [] })

  const handleMatrixSubmit = () => {
    try {
      setError('')
      setSuccess('')

      const parsedMatrix = parseMatrixInput(matrixInput)
      const parsedVector = parseVectorInput(vectorInput)
      const parsedInitialGuess = initialGuessInput.trim()
        ? parseVectorInput(initialGuessInput)
        : Array(parsedMatrix.length).fill(0)

      validateMatrix(parsedMatrix)
      validateVector(parsedVector, parsedMatrix.length)
      validateVector(parsedInitialGuess, parsedMatrix.length)

      // Check diagonal dominance
      const dominance = checkDiagonalDominance(parsedMatrix)
      setDominanceInfo(dominance)

      onMatrixChange(parsedMatrix)
      onVectorChange(parsedVector)
      onInitialGuessChange(parsedInitialGuess)

      setSuccess('Matriz y vectores configurados correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const loadExample = () => {
    const size = parseInt(exampleSize)
    const example = generateExampleMatrix(size)

    setMatrixInput(formatMatrixDisplay(example.matrix))
    setVectorInput(formatVectorDisplay(example.vector))
    setInitialGuessInput(formatVectorDisplay(Array(size).fill(0)))

    // Auto-submit example
    setTimeout(() => {
      try {
        validateMatrix(example.matrix)
        validateVector(example.vector, example.matrix.length)

        const dominance = checkDiagonalDominance(example.matrix)
        setDominanceInfo(dominance)

        onMatrixChange(example.matrix)
        onVectorChange(example.vector)
        onInitialGuessChange(Array(size).fill(0))

        setSuccess(`Ejemplo ${size}x${size} cargado correctamente`)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando ejemplo')
      }
    }, 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Sistema</CardTitle>
        <CardDescription>
          Ingresa el sistema de ecuaciones Ax = b (matrices hasta 7x7)
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Instructions */}
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            <strong>Instrucciones:</strong>
            <br />
            • Matriz A: Una fila por línea, elementos separados por espacios o
            comas
            <br />
            • Vector b: Un elemento por línea o separados por espacios/comas
            <br />• Guess inicial: Vector inicial (opcional, se usará [0,0,...]
            por defecto)
          </AlertDescription>
        </Alert>

        {/* Examples */}
        <div className='flex items-center gap-4'>
          <Label htmlFor='example-size'>Cargar ejemplo:</Label>
          <Select value={exampleSize} onValueChange={setExampleSize}>
            <SelectTrigger className='w-24'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2'>2x2</SelectItem>
              <SelectItem value='3'>3x3</SelectItem>
              <SelectItem value='4'>4x4</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadExample} variant='outline' size='sm'>
            Cargar
          </Button>
        </div>

        {/* Input Mode Tabs */}
        <Tabs
          value={inputMode}
          onValueChange={(value) => setInputMode(value as 'text' | 'grid')}
        >
          <TabsList>
            <TabsTrigger value='text'>Modo Texto</TabsTrigger>
            <TabsTrigger value='grid'>Modo Tabla</TabsTrigger>
          </TabsList>

          <TabsContent value='text' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <div>
                <Label htmlFor='matrix'>Matriz A</Label>
                <Textarea
                  id='matrix'
                  placeholder='4 -1 0&#10;-1 4 -1&#10;0 -1 4'
                  value={matrixInput}
                  onChange={(e) => setMatrixInput(e.target.value)}
                  className='h-32 font-mono text-sm'
                />
              </div>

              <div>
                <Label htmlFor='vector'>Vector b</Label>
                <Textarea
                  id='vector'
                  placeholder='3&#10;7&#10;6'
                  value={vectorInput}
                  onChange={(e) => setVectorInput(e.target.value)}
                  className='h-32 font-mono text-sm'
                />
              </div>

              <div>
                <Label htmlFor='initial-guess'>Guess inicial (opcional)</Label>
                <Textarea
                  id='initial-guess'
                  placeholder='0&#10;0&#10;0'
                  value={initialGuessInput}
                  onChange={(e) => setInitialGuessInput(e.target.value)}
                  className='h-32 font-mono text-sm'
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='grid'>
            <div className='space-y-4'>
              <Alert>
                <Lightbulb className='h-4 w-4' />
                <AlertDescription>
                  Modo tabla estará disponible en una futura actualización. Por
                  ahora, usa el modo texto que es más flexible.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleMatrixSubmit} className='w-full'>
          Configurar Sistema
        </Button>

        {/* Status Messages */}
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className='border-green-200 bg-green-50'>
            <AlertDescription className='text-green-800'>
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Matrix Information */}
        {matrix.length > 0 && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>Sistema Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <p>
                      <strong>Tamaño:</strong> {matrix.length}x{matrix.length}
                    </p>
                    <p>
                      <strong>Determinante dominante:</strong>{' '}
                      {dominanceInfo.isDiagonallyDominant ? '✅ Sí' : '❌ No'}
                    </p>
                    {!dominanceInfo.isDiagonallyDominant && (
                      <div className='text-sm text-yellow-600'>
                        <p>
                          <strong>Violaciones:</strong>
                        </p>
                        {dominanceInfo.violations.map((violation, idx) => (
                          <p key={idx} className='ml-2'>
                            • {violation}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>Convergencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2 text-sm'>
                    <p>
                      {dominanceInfo.isDiagonallyDominant
                        ? '✅ Convergencia garantizada para Jacobi y Gauss-Seidel'
                        : '⚠️ Convergencia no garantizada - verificar radio espectral'}
                    </p>
                    <p className='text-gray-600'>
                      Para SOR, el factor ω será estimado automáticamente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

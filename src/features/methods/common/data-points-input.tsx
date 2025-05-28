import { useState } from 'react'
import { InfoIcon, Plus, Minus, Copy } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface DataPoint {
  x: number
  y: number
}

interface DataPointsInputProps {
  onDataChange: (data: DataPoint[]) => void
  maxPoints?: number
  minPoints?: number
}

// Ejemplos predefinidos
const examples = {
  '3_points': {
    name: '3 Puntos (Cuadrática)',
    data: [
      { x: 0, y: 1 },
      { x: 1, y: 4 },
      { x: 2, y: 9 },
    ],
    description: 'Ejemplo simple con 3 puntos que forman una parábola',
  },
  '4_points': {
    name: '4 Puntos (Cúbica)',
    data: [
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 7 },
    ],
    description: 'Función cúbica con 4 puntos bien distribuidos',
  },
  '5_points': {
    name: '5 Puntos (Función seno)',
    data: [
      { x: 0, y: 0 },
      { x: 0.5, y: 0.479 },
      { x: 1, y: 0.841 },
      { x: 1.5, y: 0.997 },
      { x: 2, y: 0.909 },
    ],
    description: 'Puntos de la función seno para interpolación suave',
  },
  '6_points': {
    name: '6 Puntos (Oscilante)',
    data: [
      { x: -2, y: 4 },
      { x: -1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 4 },
      { x: 3, y: 9 },
    ],
    description: 'Datos con comportamiento oscilante para probar métodos',
  },
}

export default function DataPointsInput({
  onDataChange,
  maxPoints = 8,
  minPoints = 2,
}: DataPointsInputProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'text'>('manual')
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: 2, y: 9 },
  ])
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string>('')

  // Actualizar datos cuando cambian
  const updateData = (newData: DataPoint[]) => {
    setDataPoints(newData)
    onDataChange(newData)
    validateData(newData)
  }

  // Validar datos
  const validateData = (data: DataPoint[]) => {
    setError('')

    if (data.length < minPoints) {
      setError(`Se necesitan al menos ${minPoints} puntos`)
      return false
    }

    if (data.length > maxPoints) {
      setError(`Máximo ${maxPoints} puntos permitidos`)
      return false
    }

    // Verificar puntos únicos en x
    const xValues = data.map((d) => d.x)
    const uniqueX = new Set(xValues)
    if (uniqueX.size !== xValues.length) {
      setError('Los valores de x deben ser únicos')
      return false
    }

    // Verificar valores numéricos válidos
    for (const point of data) {
      if (!isFinite(point.x) || !isFinite(point.y)) {
        setError('Todos los valores deben ser números válidos')
        return false
      }
    }

    return true
  }

  // Manejar cambio en punto individual
  const handlePointChange = (
    index: number,
    field: 'x' | 'y',
    value: string
  ) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newData = [...dataPoints]
    newData[index] = { ...newData[index], [field]: numValue }
    updateData(newData)
  }

  // Agregar punto
  const addPoint = () => {
    if (dataPoints.length >= maxPoints) return

    const lastX =
      dataPoints.length > 0 ? Math.max(...dataPoints.map((d) => d.x)) : 0
    const newPoint = { x: lastX + 1, y: 0 }
    updateData([...dataPoints, newPoint])
  }

  // Eliminar punto
  const removePoint = (index: number) => {
    if (dataPoints.length <= minPoints) return

    const newData = dataPoints.filter((_, i) => i !== index)
    updateData(newData)
  }

  // Parsear entrada de texto
  const parseTextInput = (text: string): DataPoint[] => {
    const lines = text
      .trim()
      .split('\n')
      .filter((line) => line.trim())
    const points: DataPoint[] = []

    for (const line of lines) {
      // Formatos soportados: "x,y" o "x y" o "(x,y)"
      const cleaned = line.replace(/[()]/g, '').trim()
      const parts = cleaned.split(/[,\s]+/).map((p) => parseFloat(p.trim()))

      if (parts.length === 2 && parts.every(isFinite)) {
        points.push({ x: parts[0], y: parts[1] })
      }
    }

    return points
  }

  // Aplicar entrada de texto
  const applyTextInput = () => {
    try {
      const parsed = parseTextInput(textInput)
      if (parsed.length === 0) {
        setError('No se pudieron parsear los datos')
        return
      }
      updateData(parsed)
      setInputMode('manual')
    } catch (err) {
      setError('Error al parsear los datos')
    }
  }

  // Cargar ejemplo
  const loadExample = (exampleKey: keyof typeof examples) => {
    const example = examples[exampleKey]
    updateData([...example.data])
    setInputMode('manual')
  }

  // Generar texto desde datos actuales
  const generateTextFromData = () => {
    return dataPoints.map((point) => `${point.x}, ${point.y}`).join('\n')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          Puntos de Datos
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className='text-muted-foreground h-4 w-4' />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Ingrese hasta {maxPoints} puntos (x, y) para interpolación
                </p>
                <p>Los valores de x deben ser únicos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Ejemplos */}
        <div className='space-y-2'>
          <Label>Ejemplos Rápidos</Label>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(examples).map(([key, example]) => (
              <Button
                key={key}
                variant='outline'
                size='sm'
                onClick={() => loadExample(key as keyof typeof examples)}
                className='text-xs'
              >
                {example.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Modos de entrada */}
        <Tabs
          value={inputMode}
          onValueChange={(value) => setInputMode(value as 'manual' | 'text')}
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='manual'>Entrada Manual</TabsTrigger>
            <TabsTrigger value='text'>Entrada de Texto</TabsTrigger>
          </TabsList>

          <TabsContent value='manual' className='space-y-4'>
            {/* Estado actual */}
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>
                {dataPoints.length} punto{dataPoints.length !== 1 ? 's' : ''}
              </Badge>
              <Badge
                variant={
                  dataPoints.length >= minPoints &&
                  dataPoints.length <= maxPoints
                    ? 'default'
                    : 'destructive'
                }
              >
                {dataPoints.length >= minPoints &&
                dataPoints.length <= maxPoints
                  ? 'Válido'
                  : 'Inválido'}
              </Badge>
            </div>

            {/* Puntos individuales */}
            <div className='space-y-2'>
              {dataPoints.map((point, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <span className='text-muted-foreground w-8 text-sm'>
                    {index + 1}.
                  </span>
                  <Label className='w-4'>x:</Label>
                  <Input
                    type='number'
                    value={point.x}
                    onChange={(e) =>
                      handlePointChange(index, 'x', e.target.value)
                    }
                    className='w-20'
                    step='0.1'
                  />
                  <Label className='w-4'>y:</Label>
                  <Input
                    type='number'
                    value={point.y}
                    onChange={(e) =>
                      handlePointChange(index, 'y', e.target.value)
                    }
                    className='w-20'
                    step='0.1'
                  />
                  {dataPoints.length > minPoints && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => removePoint(index)}
                      className='h-8 w-8 p-1'
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Agregar punto */}
            {dataPoints.length < maxPoints && (
              <Button
                variant='outline'
                onClick={addPoint}
                className='w-full'
                size='sm'
              >
                <Plus className='mr-2 h-4 w-4' />
                Agregar Punto
              </Button>
            )}
          </TabsContent>

          <TabsContent value='text' className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label>Formato de Texto</Label>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setTextInput(generateTextFromData())}
                  className='h-6 px-2'
                >
                  <Copy className='mr-1 h-3 w-3' />
                  Datos Actuales
                </Button>
              </div>
              <Textarea
                placeholder={`Ingrese un punto por línea:
0, 1
1, 4
2, 9

Formatos soportados:
• x, y
• x y
• (x, y)`}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
              />
              <Button onClick={applyTextInput}>Aplicar Datos</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resumen de datos */}
        {dataPoints.length > 0 && (
          <div className='text-muted-foreground text-sm'>
            <p>
              <strong>Rango X:</strong> [
              {Math.min(...dataPoints.map((d) => d.x))},{' '}
              {Math.max(...dataPoints.map((d) => d.x))}]
            </p>
            <p>
              <strong>Rango Y:</strong> [
              {Math.min(...dataPoints.map((d) => d.y))},{' '}
              {Math.max(...dataPoints.map((d) => d.y))}]
            </p>
          </div>
        )}

        {/* Errores */}
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

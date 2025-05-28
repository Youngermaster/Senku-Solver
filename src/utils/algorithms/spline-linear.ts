export interface SplineLinearData {
  x: number
  y: number
}

export interface SplineLinearResult {
  converged: boolean
  segments: SplineSegment[]
  polynomial: string
  iterations: SplineLinearIteration[]
  executionTime: number
  error?: string
}

export interface SplineSegment {
  interval: [number, number]
  coefficients: [number, number] // [a, b] for ax + b
  equation: string
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
}

export interface SplineLinearIteration {
  step: number
  description: string
  segment?: SplineSegment
  operation: string
}

/**
 * Linear Spline Interpolation Method
 * Constructs piecewise linear functions between consecutive data points
 */
export function solveSplineLinear(
  data: SplineLinearData[]
): SplineLinearResult {
  const startTime = performance.now()
  const iterations: SplineLinearIteration[] = []

  try {
    if (data.length < 2) {
      throw new Error('Se necesitan al menos 2 puntos para interpolación')
    }

    if (data.length > 8) {
      throw new Error('Máximo 8 puntos permitidos')
    }

    // Verificar puntos únicos en x
    const xValues = data.map((d) => d.x)
    const uniqueX = new Set(xValues)
    if (uniqueX.size !== xValues.length) {
      throw new Error('Los valores de x deben ser únicos')
    }

    // Ordenar datos por x
    const sortedData = [...data].sort((a, b) => a.x - b.x)
    const n = sortedData.length

    iterations.push({
      step: 1,
      description: `Datos ordenados: ${n} puntos`,
      operation: `Puntos: ${sortedData.map((d) => `(${d.x}, ${d.y})`).join(', ')}`,
    })

    // Construir segmentos lineales
    const segments: SplineSegment[] = []

    for (let i = 0; i < n - 1; i++) {
      const x0 = sortedData[i].x
      const y0 = sortedData[i].y
      const x1 = sortedData[i + 1].x
      const y1 = sortedData[i + 1].y

      // Calcular pendiente
      const slope = (y1 - y0) / (x1 - x0)

      // Calcular ordenada al origen: y = mx + b => b = y - mx
      const intercept = y0 - slope * x0

      const segment: SplineSegment = {
        interval: [x0, x1],
        coefficients: [slope, intercept],
        equation: buildLinearEquation(slope, intercept),
        startPoint: { x: x0, y: y0 },
        endPoint: { x: x1, y: y1 },
      }

      segments.push(segment)

      iterations.push({
        step: i + 2,
        description: `Segmento ${i + 1}: [${formatNumber(x0)}, ${formatNumber(x1)}]`,
        segment,
        operation: `S_${i + 1}(x) = ${segment.equation} para x ∈ [${formatNumber(x0)}, ${formatNumber(x1)}]`,
      })
    }

    // Construir descripción completa del spline
    const polynomial = buildSplineDescription(segments)

    iterations.push({
      step: n + 1,
      description: 'Spline lineal completo construido',
      operation: `Spline definido por ${segments.length} segmentos lineales`,
    })

    const executionTime = performance.now() - startTime

    return {
      converged: true,
      segments,
      polynomial,
      iterations,
      executionTime,
    }
  } catch (error) {
    const executionTime = performance.now() - startTime
    return {
      converged: false,
      segments: [],
      polynomial: '',
      iterations,
      executionTime,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function buildLinearEquation(slope: number, intercept: number): string {
  let equation = ''

  // Término con x
  if (Math.abs(slope) < 1e-12) {
    equation = formatNumber(intercept)
  } else {
    if (slope === 1) {
      equation = 'x'
    } else if (slope === -1) {
      equation = '-x'
    } else {
      equation = `${formatNumber(slope)}x`
    }

    // Término independiente
    if (Math.abs(intercept) >= 1e-12) {
      if (intercept > 0) {
        equation += ` + ${formatNumber(intercept)}`
      } else {
        equation += ` - ${formatNumber(Math.abs(intercept))}`
      }
    }
  }

  return equation || '0'
}

function buildSplineDescription(segments: SplineSegment[]): string {
  if (segments.length === 0) return ''

  const descriptions = segments.map((segment, i) => {
    const [a, b] = segment.interval
    return `S_${i + 1}(x) = ${segment.equation}, x ∈ [${formatNumber(a)}, ${formatNumber(b)}]`
  })

  return descriptions.join('\n')
}

function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-12) return '0'
  if (Number.isInteger(num)) return num.toString()
  return parseFloat(num.toFixed(6)).toString()
}

/**
 * Evalúa el spline lineal en un punto dado
 */
export function evaluateSplineLinear(
  segments: SplineSegment[],
  x: number
): number {
  // Encontrar el segmento apropiado
  for (const segment of segments) {
    const [start, end] = segment.interval
    if (x >= start && x <= end) {
      const [slope, intercept] = segment.coefficients
      return slope * x + intercept
    }
  }

  // Si el punto está fuera del rango, usar extrapolación
  if (x < segments[0].interval[0]) {
    // Extrapolación hacia la izquierda usando el primer segmento
    const [slope, intercept] = segments[0].coefficients
    return slope * x + intercept
  } else {
    // Extrapolación hacia la derecha usando el último segmento
    const lastSegment = segments[segments.length - 1]
    const [slope, intercept] = lastSegment.coefficients
    return slope * x + intercept
  }
}

/**
 * Genera puntos para graficar el spline lineal
 */
export function generateSplineLinearPoints(
  segments: SplineSegment[],
  numPointsPerSegment: number = 10
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  for (const segment of segments) {
    const [start, end] = segment.interval
    const step = (end - start) / (numPointsPerSegment - 1)

    for (let i = 0; i < numPointsPerSegment; i++) {
      const x = start + i * step
      const y = evaluateSplineLinear(segments, x)
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Verifica la continuidad del spline en los puntos de unión
 */
export function verifySplineContinuity(segments: SplineSegment[]): boolean {
  for (let i = 0; i < segments.length - 1; i++) {
    const currentSegment = segments[i]
    const nextSegment = segments[i + 1]

    const connectionPoint = currentSegment.interval[1]

    const value1 = evaluateSplineLinear([currentSegment], connectionPoint)
    const value2 = evaluateSplineLinear([nextSegment], connectionPoint)

    if (Math.abs(value1 - value2) > 1e-12) {
      return false
    }
  }

  return true
}

/**
 * Calcula el error de interpolación en los puntos dados
 */
export function calculateInterpolationError(
  segments: SplineSegment[],
  originalData: SplineLinearData[]
): number[] {
  return originalData.map((point) => {
    const interpolated = evaluateSplineLinear(segments, point.x)
    return Math.abs(interpolated - point.y)
  })
}

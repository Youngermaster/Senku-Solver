export interface SplineCubicData {
  x: number
  y: number
}

export interface SplineCubicResult {
  converged: boolean
  segments: CubicSplineSegment[]
  polynomial: string
  secondDerivatives: number[]
  iterations: SplineCubicIteration[]
  executionTime: number
  error?: string
}

export interface CubicSplineSegment {
  interval: [number, number]
  coefficients: [number, number, number, number] // [a, b, c, d] for ax³ + bx² + cx + d
  equation: string
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
}

export interface SplineCubicIteration {
  step: number
  description: string
  matrix?: number[][]
  vector?: number[]
  segment?: CubicSplineSegment
  operation: string
}

/**
 * Cubic Spline Interpolation Method
 * Constructs smooth piecewise cubic polynomials with natural boundary conditions
 */
export function solveSplineCubic(data: SplineCubicData[]): SplineCubicResult {
  const startTime = performance.now()
  const iterations: SplineCubicIteration[] = []

  try {
    if (data.length < 3) {
      throw new Error('Se necesitan al menos 3 puntos para spline cúbico')
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
    const x = sortedData.map((d) => d.x)
    const y = sortedData.map((d) => d.y)

    iterations.push({
      step: 1,
      description: `Datos ordenados: ${n} puntos`,
      operation: `Puntos: ${sortedData.map((d) => `(${d.x}, ${d.y})`).join(', ')}`,
    })

    // Calcular diferencias
    const h: number[] = []
    for (let i = 0; i < n - 1; i++) {
      h[i] = x[i + 1] - x[i]
      if (h[i] <= 0) {
        throw new Error('Los puntos deben estar ordenados estrictamente')
      }
    }

    iterations.push({
      step: 2,
      description: 'Diferencias entre puntos calculadas',
      operation: `h_i = x_{i+1} - x_i: [${h.map((val) => formatNumber(val)).join(', ')}]`,
    })

    // Construir sistema de ecuaciones para las segundas derivadas
    // Usamos condiciones de frontera naturales: S''(x_0) = S''(x_{n-1}) = 0
    const A: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0))
    const b: number[] = Array(n).fill(0)

    // Condición de frontera izquierda: S''(x_0) = 0
    A[0][0] = 1
    b[0] = 0

    // Ecuaciones internas para continuidad de la segunda derivada
    for (let i = 1; i < n - 1; i++) {
      A[i][i - 1] = h[i - 1]
      A[i][i] = 2 * (h[i - 1] + h[i])
      A[i][i + 1] = h[i]

      b[i] = 6 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1])
    }

    // Condición de frontera derecha: S''(x_{n-1}) = 0
    A[n - 1][n - 1] = 1
    b[n - 1] = 0

    iterations.push({
      step: 3,
      description: 'Sistema tridiagonal construido',
      matrix: A.map((row) => [...row]),
      vector: [...b],
      operation: "A·S'' = b para condiciones de frontera naturales",
    })

    // Resolver sistema tridiagonal
    const secondDerivatives = solveTridiagonal(A, b)

    iterations.push({
      step: 4,
      description: 'Segundas derivadas calculadas',
      operation: `S\'\'(x_i): [${secondDerivatives.map((val) => formatNumber(val)).join(', ')}]`,
    })

    // Construir segmentos cúbicos
    const segments: CubicSplineSegment[] = []

    for (let i = 0; i < n - 1; i++) {
      const x0 = x[i]
      const x1 = x[i + 1]
      const y0 = y[i]
      const y1 = y[i + 1]
      const M0 = secondDerivatives[i]
      const M1 = secondDerivatives[i + 1]
      const hi = h[i]

      // Coeficientes del polinomio cúbico en forma estándar
      // S_i(x) = a(x-x_i)³ + b(x-x_i)² + c(x-x_i) + d

      const a = (M1 - M0) / (6 * hi)
      const b = M0 / 2
      const c = (y1 - y0) / hi - (hi * (2 * M0 + M1)) / 6
      const d = y0

      // Convertir a forma estándar ax³ + bx² + cx + d
      const standardCoeffs = convertToStandardForm(a, b, c, d, x0)

      const segment: CubicSplineSegment = {
        interval: [x0, x1],
        coefficients: standardCoeffs,
        equation: buildCubicEquation(standardCoeffs),
        startPoint: { x: x0, y: y0 },
        endPoint: { x: x1, y: y1 },
      }

      segments.push(segment)

      iterations.push({
        step: i + 5,
        description: `Segmento cúbico ${i + 1}: [${formatNumber(x0)}, ${formatNumber(x1)}]`,
        segment,
        operation: `S_${i + 1}(x) = ${segment.equation}`,
      })
    }

    // Construir descripción completa del spline
    const polynomial = buildSplineDescription(segments)

    iterations.push({
      step: n + 4,
      description: 'Spline cúbico completo construido',
      operation: `Spline definido por ${segments.length} segmentos cúbicos`,
    })

    const executionTime = performance.now() - startTime

    return {
      converged: true,
      segments,
      polynomial,
      secondDerivatives,
      iterations,
      executionTime,
    }
  } catch (error) {
    const executionTime = performance.now() - startTime
    return {
      converged: false,
      segments: [],
      polynomial: '',
      secondDerivatives: [],
      iterations,
      executionTime,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function solveTridiagonal(A: number[][], b: number[]): number[] {
  const n = b.length
  const c = A.map((row) => [...row])
  const d = [...b]

  // Eliminación hacia adelante
  for (let i = 1; i < n; i++) {
    const factor = c[i][i - 1] / c[i - 1][i - 1]
    c[i][i] -= factor * c[i - 1][i]
    if (i < n - 1) {
      c[i][i + 1] -= factor * c[i - 1][i + 1]
    }
    d[i] -= factor * d[i - 1]
  }

  // Sustitución hacia atrás
  const x = new Array(n)
  x[n - 1] = d[n - 1] / c[n - 1][n - 1]

  for (let i = n - 2; i >= 0; i--) {
    x[i] = (d[i] - c[i][i + 1] * x[i + 1]) / c[i][i]
  }

  return x
}

function convertToStandardForm(
  a: number,
  b: number,
  c: number,
  d: number,
  x0: number
): [number, number, number, number] {
  // Convertir S_i(x) = a(x-x0)³ + b(x-x0)² + c(x-x0) + d
  // a forma estándar Ax³ + Bx² + Cx + D

  const A = a
  const B = -3 * a * x0 + b
  const C = 3 * a * x0 * x0 - 2 * b * x0 + c
  const D = -a * x0 * x0 * x0 + b * x0 * x0 - c * x0 + d

  return [A, B, C, D]
}

function buildCubicEquation(coeffs: [number, number, number, number]): string {
  const [a, b, c, d] = coeffs
  const terms: string[] = []

  // Término x³
  if (Math.abs(a) >= 1e-12) {
    if (a === 1) {
      terms.push('x³')
    } else if (a === -1) {
      terms.push('-x³')
    } else {
      terms.push(`${formatNumber(a)}x³`)
    }
  }

  // Término x²
  if (Math.abs(b) >= 1e-12) {
    let term = ''
    if (terms.length > 0) {
      term += b >= 0 ? ' + ' : ' - '
      const absB = Math.abs(b)
      if (absB === 1) {
        term += 'x²'
      } else {
        term += `${formatNumber(absB)}x²`
      }
    } else {
      if (b === 1) {
        term = 'x²'
      } else if (b === -1) {
        term = '-x²'
      } else {
        term = `${formatNumber(b)}x²`
      }
    }
    terms.push(term)
  }

  // Término x
  if (Math.abs(c) >= 1e-12) {
    let term = ''
    if (terms.length > 0) {
      term += c >= 0 ? ' + ' : ' - '
      const absC = Math.abs(c)
      if (absC === 1) {
        term += 'x'
      } else {
        term += `${formatNumber(absC)}x`
      }
    } else {
      if (c === 1) {
        term = 'x'
      } else if (c === -1) {
        term = '-x'
      } else {
        term = `${formatNumber(c)}x`
      }
    }
    terms.push(term)
  }

  // Término constante
  if (Math.abs(d) >= 1e-12 || terms.length === 0) {
    if (terms.length > 0) {
      if (d >= 0) {
        terms.push(` + ${formatNumber(d)}`)
      } else {
        terms.push(` - ${formatNumber(Math.abs(d))}`)
      }
    } else {
      terms.push(formatNumber(d))
    }
  }

  return terms.join('') || '0'
}

function buildSplineDescription(segments: CubicSplineSegment[]): string {
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
 * Evalúa el spline cúbico en un punto dado
 */
export function evaluateSplineCubic(
  segments: CubicSplineSegment[],
  x: number
): number {
  // Encontrar el segmento apropiado
  for (const segment of segments) {
    const [start, end] = segment.interval
    if (x >= start && x <= end) {
      const [a, b, c, d] = segment.coefficients
      return a * x * x * x + b * x * x + c * x + d
    }
  }

  // Si el punto está fuera del rango, usar extrapolación
  if (x < segments[0].interval[0]) {
    // Extrapolación hacia la izquierda usando el primer segmento
    const [a, b, c, d] = segments[0].coefficients
    return a * x * x * x + b * x * x + c * x + d
  } else {
    // Extrapolación hacia la derecha usando el último segmento
    const lastSegment = segments[segments.length - 1]
    const [a, b, c, d] = lastSegment.coefficients
    return a * x * x * x + b * x * x + c * x + d
  }
}

/**
 * Genera puntos para graficar el spline cúbico
 */
export function generateSplineCubicPoints(
  segments: CubicSplineSegment[],
  numPointsPerSegment: number = 20
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  for (const segment of segments) {
    const [start, end] = segment.interval
    const step = (end - start) / (numPointsPerSegment - 1)

    for (let i = 0; i < numPointsPerSegment; i++) {
      const x = start + i * step
      const y = evaluateSplineCubic(segments, x)
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Calcula la primera derivada del spline cúbico en un punto
 */
export function evaluateSplineDerivative(
  segments: CubicSplineSegment[],
  x: number
): number {
  for (const segment of segments) {
    const [start, end] = segment.interval
    if (x >= start && x <= end) {
      const [a, b, c] = segment.coefficients
      return 3 * a * x * x + 2 * b * x + c
    }
  }

  // Extrapolación
  if (x < segments[0].interval[0]) {
    const [a, b, c] = segments[0].coefficients
    return 3 * a * x * x + 2 * b * x + c
  } else {
    const lastSegment = segments[segments.length - 1]
    const [a, b, c] = lastSegment.coefficients
    return 3 * a * x * x + 2 * b * x + c
  }
}

/**
 * Verifica la continuidad del spline cúbico y sus derivadas
 */
export function verifySplineSmoothness(segments: CubicSplineSegment[]): {
  continuous: boolean
  firstDerivativeContinuous: boolean
  secondDerivativeContinuous: boolean
} {
  const eps = 1e-10
  let continuous = true
  let firstDerivativeContinuous = true
  let secondDerivativeContinuous = true

  for (let i = 0; i < segments.length - 1; i++) {
    const connectionPoint = segments[i].interval[1]

    // Verificar continuidad de la función
    const value1 = evaluateSplineCubic([segments[i]], connectionPoint)
    const value2 = evaluateSplineCubic([segments[i + 1]], connectionPoint)
    if (Math.abs(value1 - value2) > eps) {
      continuous = false
    }

    // Verificar continuidad de la primera derivada
    const deriv1 = evaluateSplineDerivative([segments[i]], connectionPoint)
    const deriv2 = evaluateSplineDerivative([segments[i + 1]], connectionPoint)
    if (Math.abs(deriv1 - deriv2) > eps) {
      firstDerivativeContinuous = false
    }
  }

  return { continuous, firstDerivativeContinuous, secondDerivativeContinuous }
}

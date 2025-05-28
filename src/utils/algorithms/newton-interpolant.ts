export interface NewtonInterpolantData {
  x: number
  y: number
}

export interface NewtonInterpolantResult {
  converged: boolean
  coefficients: number[]
  polynomial: string
  dividedDifferences: number[][]
  iterations: NewtonIteration[]
  executionTime: number
  error?: string
}

export interface NewtonIteration {
  step: number
  description: string
  table?: number[]
  operation: string
}

/**
 * Newton Interpolating Polynomial Method
 * Uses divided differences to construct the interpolating polynomial
 */
export function solveNewtonInterpolant(
  data: NewtonInterpolantData[]
): NewtonInterpolantResult {
  const startTime = performance.now()
  const iterations: NewtonIteration[] = []

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
    const x = sortedData.map((d) => d.x)
    const y = sortedData.map((d) => d.y)

    iterations.push({
      step: 1,
      description: `Datos ordenados: ${n} puntos`,
      operation: `Puntos: ${sortedData.map((d) => `(${d.x}, ${d.y})`).join(', ')}`,
    })

    // Tabla de diferencias divididas
    const dividedDifferences: number[][] = []

    // Inicializar primera columna (orden 0)
    dividedDifferences[0] = [...y]

    iterations.push({
      step: 2,
      description: 'Diferencias divididas de orden 0 (valores y)',
      table: dividedDifferences[0],
      operation: 'f[x_i] = y_i',
    })

    // Calcular diferencias divididas de orden superior
    for (let order = 1; order < n; order++) {
      dividedDifferences[order] = []

      for (let i = 0; i < n - order; i++) {
        const numerator =
          dividedDifferences[order - 1][i + 1] -
          dividedDifferences[order - 1][i]
        const denominator = x[i + order] - x[i]

        if (Math.abs(denominator) < 1e-14) {
          throw new Error(
            `Denominador cero en diferencias divididas: x[${i + order}] = x[${i}]`
          )
        }

        dividedDifferences[order][i] = numerator / denominator
      }

      iterations.push({
        step: order + 2,
        description: `Diferencias divididas de orden ${order}`,
        table: dividedDifferences[order],
        operation: `f[x_${order}, ..., x_${order}] = (f[x_1, ..., x_${order}] - f[x_0, ..., x_${order - 1}]) / (x_${order} - x_0)`,
      })
    }

    // Los coeficientes son las diferencias divididas de la diagonal principal
    const coefficients = dividedDifferences.map((row) => row[0])

    iterations.push({
      step: n + 2,
      description: 'Coeficientes extraídos de la diagonal principal',
      operation: `Coeficientes: [${coefficients.map((c) => formatNumber(c)).join(', ')}]`,
    })

    // Construir polinomio en forma de Newton
    const polynomial = buildNewtonPolynomialString(coefficients, x)

    iterations.push({
      step: n + 3,
      description: 'Polinomio de Newton construido',
      operation: `P(x) = ${polynomial}`,
    })

    const executionTime = performance.now() - startTime

    return {
      converged: true,
      coefficients,
      polynomial,
      dividedDifferences,
      iterations,
      executionTime,
    }
  } catch (error) {
    const executionTime = performance.now() - startTime
    return {
      converged: false,
      coefficients: [],
      polynomial: '',
      dividedDifferences: [],
      iterations,
      executionTime,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function buildNewtonPolynomialString(
  coefficients: number[],
  x: number[]
): string {
  if (coefficients.length === 0) return '0'

  let polynomial = formatNumber(coefficients[0])

  for (let i = 1; i < coefficients.length; i++) {
    const coeff = coefficients[i]

    if (Math.abs(coeff) < 1e-12) continue

    // Signo
    if (coeff >= 0) {
      polynomial += ' + '
    } else {
      polynomial += ' - '
    }

    // Coeficiente
    const absCoeff = Math.abs(coeff)
    if (absCoeff !== 1) {
      polynomial += formatNumber(absCoeff)
    }

    // Producto de términos (x - x_j)
    for (let j = 0; j < i; j++) {
      if (x[j] >= 0) {
        polynomial += `(x - ${formatNumber(x[j])})`
      } else {
        polynomial += `(x + ${formatNumber(Math.abs(x[j]))})`
      }
    }
  }

  return polynomial
}

function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-12) return '0'
  if (Number.isInteger(num)) return num.toString()
  return parseFloat(num.toFixed(6)).toString()
}

/**
 * Evalúa el polinomio de Newton en un punto dado
 */
export function evaluateNewtonPolynomial(
  coefficients: number[],
  xData: number[],
  x: number
): number {
  if (coefficients.length === 0) return 0

  let result = coefficients[0]

  for (let i = 1; i < coefficients.length; i++) {
    let product = 1
    for (let j = 0; j < i; j++) {
      product *= x - xData[j]
    }
    result += coefficients[i] * product
  }

  return result
}

/**
 * Convierte el polinomio de Newton a forma estándar
 */
export function newtonToStandardForm(
  newtonCoeffs: number[],
  xData: number[]
): number[] {
  const n = newtonCoeffs.length
  const standardCoeffs = new Array(n).fill(0)

  // Empezar con el primer término
  standardCoeffs[0] = newtonCoeffs[0]

  // Para cada término de Newton
  for (let i = 1; i < n; i++) {
    const coeff = newtonCoeffs[i]

    // Expandir el producto (x - x_0)(x - x_1)...(x - x_{i-1})
    const tempCoeffs = new Array(i + 1).fill(0)
    tempCoeffs[0] = 1

    for (let j = 0; j < i; j++) {
      for (let k = j; k >= 0; k--) {
        tempCoeffs[k + 1] += tempCoeffs[k]
        tempCoeffs[k] *= -xData[j]
      }
    }

    // Agregar a los coeficientes estándar
    for (let k = 0; k <= i; k++) {
      standardCoeffs[k] += coeff * tempCoeffs[k]
    }
  }

  return standardCoeffs
}

/**
 * Genera puntos para graficar el polinomio de Newton
 */
export function generateNewtonPoints(
  coefficients: number[],
  xData: number[],
  xMin: number,
  xMax: number,
  numPoints: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = evaluateNewtonPolynomial(coefficients, xData, x)
    points.push({ x, y })
  }

  return points
}

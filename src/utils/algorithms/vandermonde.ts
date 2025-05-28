export interface VandermondeData {
  x: number
  y: number
}

export interface VandermondeResult {
  converged: boolean
  coefficients: number[]
  polynomial: string
  iterations: VandermondeIteration[]
  executionTime: number
  error?: string
}

export interface VandermondeIteration {
  step: number
  description: string
  matrix?: number[][]
  vector?: number[]
  operation: string
}

/**
 * Vandermonde Interpolation Method
 * Constructs the Vandermonde matrix and solves for polynomial coefficients
 */
export function solveVandermonde(data: VandermondeData[]): VandermondeResult {
  const startTime = performance.now()
  const iterations: VandermondeIteration[] = []

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

    const n = data.length
    const xValues_sorted = data.map((d) => d.x)
    const yValues = data.map((d) => d.y)

    iterations.push({
      step: 1,
      description: `Datos de entrada: ${n} puntos`,
      operation: `Puntos: ${data.map((d) => `(${d.x}, ${d.y})`).join(', ')}`,
    })

    // Construir matriz de Vandermonde
    const vandermondeMatrix: number[][] = []
    for (let i = 0; i < n; i++) {
      const row: number[] = []
      for (let j = 0; j < n; j++) {
        row.push(Math.pow(xValues_sorted[i], j))
      }
      vandermondeMatrix.push(row)
    }

    iterations.push({
      step: 2,
      description: 'Matriz de Vandermonde construida',
      matrix: vandermondeMatrix.map((row) => [...row]),
      operation: 'V[i,j] = x_i^j',
    })

    // Resolver sistema usando eliminación gaussiana
    const augmentedMatrix = vandermondeMatrix.map((row, i) => [
      ...row,
      yValues[i],
    ])

    iterations.push({
      step: 3,
      description: 'Matriz aumentada [V|y]',
      matrix: augmentedMatrix.map((row) => [...row]),
      operation: 'Preparando eliminación gaussiana',
    })

    // Eliminación hacia adelante
    for (let k = 0; k < n - 1; k++) {
      // Buscar pivote
      let maxRow = k
      for (let i = k + 1; i < n; i++) {
        if (
          Math.abs(augmentedMatrix[i][k]) > Math.abs(augmentedMatrix[maxRow][k])
        ) {
          maxRow = i
        }
      }

      // Intercambiar filas si es necesario
      if (maxRow !== k) {
        ;[augmentedMatrix[k], augmentedMatrix[maxRow]] = [
          augmentedMatrix[maxRow],
          augmentedMatrix[k],
        ]
        iterations.push({
          step: iterations.length + 1,
          description: `Intercambio de filas ${k + 1} ↔ ${maxRow + 1}`,
          matrix: augmentedMatrix.map((row) => [...row]),
          operation: 'Pivoteo parcial',
        })
      }

      // Verificar pivote no nulo
      if (Math.abs(augmentedMatrix[k][k]) < 1e-14) {
        throw new Error('Sistema singular: no hay solución única')
      }

      // Eliminación
      for (let i = k + 1; i < n; i++) {
        const factor = augmentedMatrix[i][k] / augmentedMatrix[k][k]
        for (let j = k; j < n + 1; j++) {
          augmentedMatrix[i][j] -= factor * augmentedMatrix[k][j]
        }
      }

      iterations.push({
        step: iterations.length + 1,
        description: `Eliminación columna ${k + 1}`,
        matrix: augmentedMatrix.map((row) => [...row]),
        operation: `Factor de eliminación aplicado`,
      })
    }

    // Sustitución hacia atrás
    const coefficients: number[] = new Array(n)
    for (let i = n - 1; i >= 0; i--) {
      coefficients[i] = augmentedMatrix[i][n]
      for (let j = i + 1; j < n; j++) {
        coefficients[i] -= augmentedMatrix[i][j] * coefficients[j]
      }
      coefficients[i] /= augmentedMatrix[i][i]
    }

    iterations.push({
      step: iterations.length + 1,
      description: 'Sustitución hacia atrás completada',
      vector: [...coefficients],
      operation: 'Coeficientes del polinomio calculados',
    })

    // Construir polinomio
    const polynomial = buildPolynomialString(coefficients)

    iterations.push({
      step: iterations.length + 1,
      description: 'Polinomio construido',
      operation: `P(x) = ${polynomial}`,
    })

    const executionTime = performance.now() - startTime

    return {
      converged: true,
      coefficients,
      polynomial,
      iterations,
      executionTime,
    }
  } catch (error) {
    const executionTime = performance.now() - startTime
    return {
      converged: false,
      coefficients: [],
      polynomial: '',
      iterations,
      executionTime,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function buildPolynomialString(coefficients: number[]): string {
  const terms: string[] = []

  for (let i = coefficients.length - 1; i >= 0; i--) {
    const coeff = coefficients[i]

    if (Math.abs(coeff) < 1e-12) continue

    let term = ''

    // Signo
    if (terms.length > 0) {
      term += coeff >= 0 ? ' + ' : ' - '
      const absCoeff = Math.abs(coeff)

      // Coeficiente
      if (i === 0 || absCoeff !== 1) {
        term += formatNumber(absCoeff)
      }
    } else {
      if (coeff < 0) {
        term += '-'
        const absCoeff = Math.abs(coeff)
        if (i === 0 || absCoeff !== 1) {
          term += formatNumber(absCoeff)
        }
      } else {
        if (i === 0 || coeff !== 1) {
          term += formatNumber(coeff)
        }
      }
    }

    // Variable y exponente
    if (i > 0) {
      if (i === 1) {
        term += 'x'
      } else {
        term += `x^${i}`
      }
    }

    terms.push(term)
  }

  return terms.length > 0 ? terms.join('') : '0'
}

function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-12) return '0'
  if (Number.isInteger(num)) return num.toString()
  return parseFloat(num.toFixed(6)).toString()
}

/**
 * Evalúa el polinomio en un punto dado
 */
export function evaluatePolynomial(coefficients: number[], x: number): number {
  let result = 0
  for (let i = 0; i < coefficients.length; i++) {
    result += coefficients[i] * Math.pow(x, i)
  }
  return result
}

/**
 * Genera puntos para graficar el polinomio
 */
export function generatePolynomialPoints(
  coefficients: number[],
  xMin: number,
  xMax: number,
  numPoints: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = evaluatePolynomial(coefficients, x)
    points.push({ x, y })
  }

  return points
}

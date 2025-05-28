export interface LagrangeData {
  x: number
  y: number
}

export interface LagrangeResult {
  converged: boolean
  coefficients: number[]
  polynomial: string
  lagrangeBases: LagrangeBasis[]
  iterations: LagrangeIteration[]
  executionTime: number
  error?: string
}

export interface LagrangeBasis {
  index: number
  coefficient: number
  numerator: string
  denominator: string
  basis: string
}

export interface LagrangeIteration {
  step: number
  description: string
  basis?: LagrangeBasis
  operation: string
}

/**
 * Lagrange Interpolation Method
 * Constructs the interpolating polynomial using Lagrange basis functions
 */
export function solveLagrange(data: LagrangeData[]): LagrangeResult {
  const startTime = performance.now()
  const iterations: LagrangeIteration[] = []

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
    const x = data.map((d) => d.x)
    const y = data.map((d) => d.y)

    iterations.push({
      step: 1,
      description: `Datos de entrada: ${n} puntos`,
      operation: `Puntos: ${data.map((d) => `(${d.x}, ${d.y})`).join(', ')}`,
    })

    // Construir las funciones base de Lagrange
    const lagrangeBases: LagrangeBasis[] = []

    for (let i = 0; i < n; i++) {
      // Construir L_i(x)
      const numeratorTerms: string[] = []
      const denominatorTerms: number[] = []

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          // Numerador: (x - x_j)
          if (x[j] >= 0) {
            numeratorTerms.push(`(x - ${formatNumber(x[j])})`)
          } else {
            numeratorTerms.push(`(x + ${formatNumber(Math.abs(x[j]))})`)
          }

          // Denominador: (x_i - x_j)
          denominatorTerms.push(x[i] - x[j])
        }
      }

      const numerator = numeratorTerms.join('')
      const denominatorValue = denominatorTerms.reduce(
        (prod, term) => prod * term,
        1
      )
      const denominator = denominatorTerms
        .map((term) => formatNumber(term))
        .join(' × ')

      if (Math.abs(denominatorValue) < 1e-14) {
        throw new Error(`Denominador cero en función base L_${i}`)
      }

      const coefficient = y[i] / denominatorValue
      const basis = `(${formatNumber(y[i])} / ${formatNumber(denominatorValue)}) × ${numerator}`

      lagrangeBases.push({
        index: i,
        coefficient,
        numerator,
        denominator,
        basis,
      })

      iterations.push({
        step: i + 2,
        description: `Función base L_${i}(x) construida`,
        basis: lagrangeBases[i],
        operation: `L_${i}(x) = ${basis}`,
      })
    }

    // Expandir cada término de Lagrange y sumar
    const standardCoeffs = new Array(n).fill(0)

    for (let i = 0; i < n; i++) {
      const termCoeffs = expandLagrangeTerms(x, i, y[i])
      for (let j = 0; j < termCoeffs.length; j++) {
        standardCoeffs[j] += termCoeffs[j]
      }
    }

    iterations.push({
      step: n + 2,
      description: 'Expansión a forma estándar completada',
      operation: `Coeficientes: [${standardCoeffs.map((c) => formatNumber(c)).join(', ')}]`,
    })

    // Construir polinomio en forma estándar
    const polynomial = buildStandardPolynomialString(standardCoeffs)

    iterations.push({
      step: n + 3,
      description: 'Polinomio en forma estándar',
      operation: `P(x) = ${polynomial}`,
    })

    const executionTime = performance.now() - startTime

    return {
      converged: true,
      coefficients: standardCoeffs,
      polynomial,
      lagrangeBases,
      iterations,
      executionTime,
    }
  } catch (error) {
    const executionTime = performance.now() - startTime
    return {
      converged: false,
      coefficients: [],
      polynomial: '',
      lagrangeBases: [],
      iterations,
      executionTime,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function expandLagrangeTerms(
  xData: number[],
  skipIndex: number,
  yValue: number
): number[] {
  const n = xData.length
  const coeffs = new Array(n).fill(0)

  // Inicializar con el coeficiente constante
  coeffs[0] = 1

  // Construir el producto (x - x_j) para j ≠ skipIndex
  for (let j = 0; j < n; j++) {
    if (j !== skipIndex) {
      // Multiplicar por (x - x_j)
      for (let k = n - 1; k > 0; k--) {
        coeffs[k] = coeffs[k - 1] - xData[j] * coeffs[k]
      }
      coeffs[0] *= -xData[j]
    }
  }

  // Calcular denominador
  let denominator = 1
  for (let j = 0; j < n; j++) {
    if (j !== skipIndex) {
      denominator *= xData[skipIndex] - xData[j]
    }
  }

  // Multiplicar por y_i / denominador
  for (let k = 0; k < n; k++) {
    coeffs[k] *= yValue / denominator
  }

  return coeffs
}

function buildStandardPolynomialString(coefficients: number[]): string {
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
 * Evalúa el polinomio de Lagrange en un punto dado
 */
export function evaluateLagrangePolynomial(
  data: LagrangeData[],
  x: number
): number {
  let result = 0
  const n = data.length

  for (let i = 0; i < n; i++) {
    let Li = 1

    // Calcular L_i(x)
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        Li *= (x - data[j].x) / (data[i].x - data[j].x)
      }
    }

    result += data[i].y * Li
  }

  return result
}

/**
 * Evalúa usando coeficientes estándar
 */
export function evaluateStandardPolynomial(
  coefficients: number[],
  x: number
): number {
  let result = 0
  for (let i = 0; i < coefficients.length; i++) {
    result += coefficients[i] * Math.pow(x, i)
  }
  return result
}

/**
 * Genera puntos para graficar el polinomio de Lagrange
 */
export function generateLagrangePoints(
  coefficients: number[],
  xMin: number,
  xMax: number,
  numPoints: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const step = (xMax - xMin) / (numPoints - 1)

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const y = evaluateStandardPolynomial(coefficients, x)
    points.push({ x, y })
  }

  return points
}

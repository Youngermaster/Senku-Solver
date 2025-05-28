export interface BisectionResult {
  root: number
  error: number
  iterations: number
  converged: boolean
  message: string
  iterationData: {
    iteration: number
    xi: number
    xs: number
    xm: number
    fxi: number
    fxs: number
    fxm: number
    error: number
  }[]
}

export interface BisectionParams {
  xi: number // Initial value of interval
  xs: number // Final value of interval
  tolerance: number // Error tolerance
  maxIterations: number // Maximum number of iterations
  functionExpression: string // Function expression as string
}

// Function to evaluate mathematical expressions safely
function evaluateFunction(expression: string, x: number): number {
  try {
    // Replace x with the actual value and common math functions
    const expr = expression
      .replace(/x/g, x.toString())
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/log/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/\^/g, '**') // Replace ^ with ** for exponentiation

    return Function('"use strict"; return (' + expr + ')')()
  } catch (error) {
    throw new Error(`Error evaluating function: ${error}`)
  }
}

export function bisectionMethod(params: BisectionParams): BisectionResult {
  const {
    xi: initialXi,
    xs: initialXs,
    tolerance,
    maxIterations,
    functionExpression,
  } = params

  let xi = initialXi
  let xs = initialXs

  const iterationData: BisectionResult['iterationData'] = []

  try {
    // Evaluate function at initial points
    const fi = evaluateFunction(functionExpression, xi)
    const fs = evaluateFunction(functionExpression, xs)

    // Check if initial points are roots
    if (Math.abs(fi) < tolerance) {
      return {
        root: xi,
        error: 0,
        iterations: 0,
        converged: true,
        message: `${xi} es raíz de f(x)`,
        iterationData: [],
      }
    }

    if (Math.abs(fs) < tolerance) {
      return {
        root: xs,
        error: 0,
        iterations: 0,
        converged: true,
        message: `${xs} es raíz de f(x)`,
        iterationData: [],
      }
    }

    // Check if the interval is adequate (function values have opposite signs)
    if (fi * fs >= 0) {
      return {
        root: NaN,
        error: NaN,
        iterations: 0,
        converged: false,
        message: 'El intervalo es inadecuado - la función no cambia de signo',
        iterationData: [],
      }
    }

    let iteration = 0
    let xm = (xi + xs) / 2
    let fm = evaluateFunction(functionExpression, xm)
    let error = tolerance + 1 // Initialize error greater than tolerance

    while (
      error > tolerance &&
      Math.abs(fm) > tolerance &&
      iteration < maxIterations
    ) {
      const fxi = evaluateFunction(functionExpression, xi)
      const fxs = evaluateFunction(functionExpression, xs)

      // Store iteration data
      iterationData.push({
        iteration: iteration + 1,
        xi,
        xs,
        xm,
        fxi,
        fxs,
        fxm: fm,
        error: iteration === 0 ? 0 : error,
      })

      // Determine which subinterval contains the root
      if (fxi * fm < 0) {
        xs = xm
      } else {
        xi = xm
      }

      const xa = xm
      xm = (xi + xs) / 2
      fm = evaluateFunction(functionExpression, xm)

      // Calculate error
      if (iteration > 0) {
        error = Math.abs(xm - xa)
      }

      iteration++
    }

    // Add final iteration data
    const fxi = evaluateFunction(functionExpression, xi)
    const fxs = evaluateFunction(functionExpression, xs)
    iterationData.push({
      iteration: iteration,
      xi,
      xs,
      xm,
      fxi,
      fxs,
      fxm: fm,
      error,
    })

    // Determine the result
    if (Math.abs(fm) < tolerance) {
      return {
        root: xm,
        error,
        iterations: iteration,
        converged: true,
        message: `${xm.toFixed(6)} es raíz de f(x)`,
        iterationData,
      }
    } else if (error < tolerance) {
      return {
        root: xm,
        error,
        iterations: iteration,
        converged: true,
        message: `${xm.toFixed(6)} es una aproximación de una raíz de f(x) con una tolerancia = ${tolerance}`,
        iterationData,
      }
    } else {
      return {
        root: xm,
        error,
        iterations: iteration,
        converged: false,
        message: `Fracasó en ${maxIterations} iteraciones`,
        iterationData,
      }
    }
  } catch (error) {
    return {
      root: NaN,
      error: NaN,
      iterations: 0,
      converged: false,
      message: `Error en el cálculo: ${error}`,
      iterationData: [],
    }
  }
}

// Default function for testing: log(sin(x)^2 + 1) - (1/2)
export const defaultFunction = 'log(sin(x)^2 + 1) - (1/2)'

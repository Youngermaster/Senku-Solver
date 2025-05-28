export interface FixedPointResult {
  root: number
  error: number
  iterations: number
  converged: boolean
  message: string
  iterationData: {
    iteration: number
    xn: number
    fxn: number
    error: number
  }[]
}

export interface FixedPointParams {
  x0: number // Initial value
  tolerance: number // Error tolerance
  maxIterations: number // Maximum number of iterations
  functionExpression: string // Function f(x) expression as string
  gFunctionExpression: string // Function g(x) expression as string
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

export function fixedPointMethod(params: FixedPointParams): FixedPointResult {
  const {
    x0: initialX0,
    tolerance,
    maxIterations,
    functionExpression,
    gFunctionExpression,
  } = params

  let x0 = initialX0
  const iterationData: FixedPointResult['iterationData'] = []

  try {
    let iteration = 0
    let fm = evaluateFunction(functionExpression, x0)
    let error = tolerance + 1 // Initialize error greater than tolerance

    // Store initial iteration data
    iterationData.push({
      iteration: 0,
      xn: x0,
      fxn: fm,
      error: 0,
    })

    while (
      error > tolerance &&
      Math.abs(fm) > tolerance &&
      iteration < maxIterations
    ) {
      // Calculate next value using g(x)
      const xn = evaluateFunction(gFunctionExpression, x0)
      fm = evaluateFunction(functionExpression, xn)
      error = Math.abs(xn - x0)

      iteration++

      // Store iteration data
      iterationData.push({
        iteration,
        xn,
        fxn: fm,
        error,
      })

      x0 = xn
    }

    // Determine the result
    if (Math.abs(fm) < tolerance) {
      return {
        root: x0,
        error,
        iterations: iteration,
        converged: true,
        message: `${x0.toFixed(6)} es raíz de f(x)`,
        iterationData,
      }
    } else if (error < tolerance) {
      return {
        root: x0,
        error,
        iterations: iteration,
        converged: true,
        message: `${x0.toFixed(6)} es una aproximación de una raíz de f(x) con una tolerancia = ${tolerance}`,
        iterationData,
      }
    } else {
      return {
        root: x0,
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

// Default functions for testing
export const defaultFFunction = 'sin(x - 0.001) - x'
export const defaultGFunction = 'sin(x - 0.001)'

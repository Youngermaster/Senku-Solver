export interface SecantResult {
  root: number
  error: number
  iterations: number
  converged: boolean
  message: string
  iterationData: {
    iteration: number
    x0: number
    x1: number
    fx0: number
    fx1: number
    error: number
  }[]
}

export interface SecantParams {
  x0: number // First initial value
  x1: number // Second initial value
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

export function secantMethod(params: SecantParams): SecantResult {
  const {
    x0: initialX0,
    x1: initialX1,
    tolerance,
    maxIterations,
    functionExpression,
  } = params

  let x0 = initialX0
  let x1 = initialX1

  const iterationData: SecantResult['iterationData'] = []

  try {
    let iteration = 0
    let fx0 = evaluateFunction(functionExpression, x0)
    let fx1 = evaluateFunction(functionExpression, x1)
    let error = tolerance + 1 // Initialize error greater than tolerance

    // Check if initial points are roots
    if (Math.abs(fx0) < tolerance) {
      return {
        root: x0,
        error: 0,
        iterations: 0,
        converged: true,
        message: `${x0} es raíz de f(x)`,
        iterationData: [],
      }
    }

    if (Math.abs(fx1) < tolerance) {
      return {
        root: x1,
        error: 0,
        iterations: 0,
        converged: true,
        message: `${x1} es raíz de f(x)`,
        iterationData: [],
      }
    }

    // Store initial iteration data
    iterationData.push({
      iteration: 0,
      x0,
      x1,
      fx0,
      fx1,
      error: 0,
    })

    while (
      error > tolerance &&
      Math.abs(fx1) > tolerance &&
      iteration < maxIterations
    ) {
      // Check if the denominator is zero (parallel secant)
      if (Math.abs(fx1 - fx0) < 1e-12) {
        return {
          root: x1,
          error,
          iterations: iteration,
          converged: false,
          message:
            'División por cero - los puntos generan una secante paralela al eje x',
          iterationData,
        }
      }

      // Secant formula: x2 = x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))
      const x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0)
      const fx2 = evaluateFunction(functionExpression, x2)
      error = Math.abs(x2 - x1)

      iteration++

      // Store iteration data
      iterationData.push({
        iteration,
        x0: x1,
        x1: x2,
        fx0: fx1,
        fx1: fx2,
        error,
      })

      // Update values for next iteration
      x0 = x1
      x1 = x2
      fx0 = fx1
      fx1 = fx2
    }

    // Determine the result
    if (Math.abs(fx1) < tolerance) {
      return {
        root: x1,
        error,
        iterations: iteration,
        converged: true,
        message: `${x1.toFixed(6)} es raíz de f(x)`,
        iterationData,
      }
    } else if (error < tolerance) {
      return {
        root: x1,
        error,
        iterations: iteration,
        converged: true,
        message: `${x1.toFixed(6)} es una aproximación de una raíz de f(x) con una tolerancia = ${tolerance}`,
        iterationData,
      }
    } else {
      return {
        root: x1,
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

// Default function for testing
export const defaultFunction = 'log(sin(x)**2 + 1) - 1/2'

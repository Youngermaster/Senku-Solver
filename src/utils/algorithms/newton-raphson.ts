export interface NewtonRaphsonResult {
  root: number
  error: number
  iterations: number
  converged: boolean
  message: string
  iterationData: {
    iteration: number
    xn: number
    fxn: number
    dfxn: number
    error: number
  }[]
}

export interface NewtonRaphsonParams {
  x0: number // Initial value
  tolerance: number // Error tolerance
  maxIterations: number // Maximum number of iterations
  functionExpression: string // Function f(x) expression as string
  derivativeExpression: string // Derivative f'(x) expression as string
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

export function newtonRaphsonMethod(
  params: NewtonRaphsonParams
): NewtonRaphsonResult {
  const {
    x0: initialX0,
    tolerance,
    maxIterations,
    functionExpression,
    derivativeExpression,
  } = params

  let x0 = initialX0
  const iterationData: NewtonRaphsonResult['iterationData'] = []

  try {
    let iteration = 0
    let fm = evaluateFunction(functionExpression, x0)
    let dfm = evaluateFunction(derivativeExpression, x0)
    let error = tolerance + 1 // Initialize error greater than tolerance

    // Store initial iteration data
    iterationData.push({
      iteration: 0,
      xn: x0,
      fxn: fm,
      dfxn: dfm,
      error: 0,
    })

    while (
      error > tolerance &&
      Math.abs(fm) > tolerance &&
      iteration < maxIterations
    ) {
      // Check if derivative is zero (potential multiple root or division by zero)
      if (Math.abs(dfm) < 1e-12) {
        return {
          root: x0,
          error,
          iterations: iteration,
          converged: false,
          message: `${x0.toFixed(6)} es una posible raíz múltiple de f(x) - derivada cercana a cero`,
          iterationData,
        }
      }

      // Newton-Raphson formula: x_{n+1} = x_n - f(x_n)/f'(x_n)
      const xn = x0 - fm / dfm
      fm = evaluateFunction(functionExpression, xn)
      dfm = evaluateFunction(derivativeExpression, xn)
      error = Math.abs(xn - x0)

      iteration++

      // Store iteration data
      iterationData.push({
        iteration,
        xn,
        fxn: fm,
        dfxn: dfm,
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

// Default functions for testing based on MATLAB code
export const defaultFunction = 'sin(2*x) - (x/3)**3 + 0.1'
export const defaultDerivative = '2*cos(2*x) - (x**2)/3'

export interface MultipleRootsResult {
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
    d2fxn: number
    error: number
  }[]
}

export interface MultipleRootsParams {
  x0: number // Initial value
  tolerance: number // Error tolerance
  maxIterations: number // Maximum number of iterations
  functionExpression: string // Function f(x) expression as string
  derivativeExpression: string // First derivative f'(x) expression as string
  secondDerivativeExpression: string // Second derivative f''(x) expression as string
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

export function multipleRootsMethod(
  params: MultipleRootsParams
): MultipleRootsResult {
  const {
    x0: initialX0,
    tolerance,
    maxIterations,
    functionExpression,
    derivativeExpression,
    secondDerivativeExpression,
  } = params

  let x0 = initialX0
  const iterationData: MultipleRootsResult['iterationData'] = []

  try {
    let iteration = 0
    let fm = evaluateFunction(functionExpression, x0)
    let dfm = evaluateFunction(derivativeExpression, x0)
    let d2fm = evaluateFunction(secondDerivativeExpression, x0)
    let error = tolerance + 1 // Initialize error greater than tolerance

    // Store initial iteration data
    iterationData.push({
      iteration: 0,
      xn: x0,
      fxn: fm,
      dfxn: dfm,
      d2fxn: d2fm,
      error: 0,
    })

    while (
      error > tolerance &&
      Math.abs(fm) > tolerance &&
      iteration < maxIterations
    ) {
      // Check if derivatives are zero
      if (Math.abs(dfm) < 1e-12) {
        return {
          root: x0,
          error,
          iterations: iteration,
          converged: false,
          message: 'Primera derivada cercana a cero - no se puede continuar',
          iterationData,
        }
      }

      const denominator = dfm ** 2 - fm * d2fm
      if (Math.abs(denominator) < 1e-12) {
        return {
          root: x0,
          error,
          iterations: iteration,
          converged: false,
          message:
            'Denominador cercano a cero en la fórmula de raíces múltiples',
          iterationData,
        }
      }

      // Modified Newton-Raphson formula for multiple roots:
      // x_{n+1} = x_n - (f(x_n) * f'(x_n)) / (f'(x_n)^2 - f(x_n) * f''(x_n))
      const xn = x0 - (fm * dfm) / denominator
      fm = evaluateFunction(functionExpression, xn)
      dfm = evaluateFunction(derivativeExpression, xn)
      d2fm = evaluateFunction(secondDerivativeExpression, xn)
      error = Math.abs(xn - x0)

      iteration++

      // Store iteration data
      iterationData.push({
        iteration,
        xn,
        fxn: fm,
        dfxn: dfm,
        d2fxn: d2fm,
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
        message: `${x0.toFixed(6)} es raíz múltiple de f(x)`,
        iterationData,
      }
    } else if (error < tolerance) {
      return {
        root: x0,
        error,
        iterations: iteration,
        converged: true,
        message: `${x0.toFixed(6)} es una aproximación de una raíz múltiple de f(x) con una tolerancia = ${tolerance}`,
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

// Default functions for testing - function with multiple root at x = 0
export const defaultFunction = '(x - 1)**3'
export const defaultDerivative = '3*(x - 1)**2'
export const defaultSecondDerivative = '6*(x - 1)'

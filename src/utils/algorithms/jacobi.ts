export interface JacobiParams {
  matrix: number[][]
  vector: number[]
  initialGuess: number[]
  tolerance: number
  maxIterations: number
}

export interface JacobiIteration {
  iteration: number
  x: number[]
  error: number
  relativeError: number
}

export interface JacobiResult {
  solution: number[]
  iterations: JacobiIteration[]
  converged: boolean
  spectralRadius: number
  canConverge: boolean
  executionTime: number
  totalIterations: number
  finalError: number
}

// Utility functions for matrix operations
function matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * vector[index], 0)
  )
}

function vectorSubtract(a: number[], b: number[]): number[] {
  return a.map((value, index) => value - b[index])
}

function vectorNorm(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
}

function relativeErrorNorm(current: number[], previous: number[]): number {
  const diff = vectorSubtract(current, previous)
  const currentNorm = vectorNorm(current)
  return currentNorm > 0 ? vectorNorm(diff) / currentNorm : vectorNorm(diff)
}

// Calculate spectral radius of iteration matrix
function calculateSpectralRadius(matrix: number[][]): number {
  const n = matrix.length

  // Create D^(-1)
  const DInv = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) =>
          i === j ? (matrix[i][i] !== 0 ? 1 / matrix[i][i] : 0) : 0
        )
    )

  // Create -(L + U)
  const LPlusU = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => (i === j ? 0 : -matrix[i][j]))
    )

  // T = D^(-1) * (-(L + U))
  const T = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => {
          let sum = 0
          for (let k = 0; k < n; k++) {
            sum += DInv[i][k] * LPlusU[k][j]
          }
          return sum
        })
    )

  // Simple approximation of spectral radius using Gershgorin circles
  let maxRadius = 0
  for (let i = 0; i < n; i++) {
    let rowSum = 0
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        rowSum += Math.abs(T[i][j])
      }
    }
    const radius = Math.abs(T[i][i]) + rowSum
    maxRadius = Math.max(maxRadius, radius)
  }

  return maxRadius
}

export function jacobi(params: JacobiParams): JacobiResult {
  const startTime = performance.now()

  const { matrix, vector, initialGuess, tolerance, maxIterations } = params
  const n = matrix.length
  const iterations: JacobiIteration[] = []

  // Check for zero diagonal elements
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) {
      throw new Error(
        `Elemento diagonal cero en la fila ${i + 1}. El método de Jacobi no puede continuar.`
      )
    }
  }

  // Calculate spectral radius
  const spectralRadius = calculateSpectralRadius(matrix)
  const canConverge = spectralRadius < 1

  let x = [...initialGuess]
  let converged = false
  let iteration = 0

  // Initial iteration
  iterations.push({
    iteration: 0,
    x: [...x],
    error: 0,
    relativeError: 0,
  })

  while (iteration < maxIterations && !converged) {
    const xNew = Array(n).fill(0)

    // Jacobi iteration: x_i^(k+1) = (b_i - sum(a_ij * x_j^(k))) / a_ii
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sum += matrix[i][j] * x[j]
        }
      }
      xNew[i] = (vector[i] - sum) / matrix[i][i]
    }

    // Calculate errors
    const error = vectorNorm(vectorSubtract(xNew, x))
    const relativeError = relativeErrorNorm(xNew, x)

    iteration++
    x = xNew

    iterations.push({
      iteration,
      x: [...x],
      error,
      relativeError,
    })

    // Check convergence
    if (relativeError < tolerance) {
      converged = true
    }
  }

  const endTime = performance.now()

  return {
    solution: x,
    iterations,
    converged,
    spectralRadius,
    canConverge,
    executionTime: endTime - startTime,
    totalIterations: iteration,
    finalError: iterations[iterations.length - 1]?.relativeError || 0,
  }
}

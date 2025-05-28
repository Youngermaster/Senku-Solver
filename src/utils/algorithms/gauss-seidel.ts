export interface GaussSeidelParams {
  matrix: number[][]
  vector: number[]
  initialGuess: number[]
  tolerance: number
  maxIterations: number
}

export interface GaussSeidelIteration {
  iteration: number
  x: number[]
  error: number
  relativeError: number
}

export interface GaussSeidelResult {
  solution: number[]
  iterations: GaussSeidelIteration[]
  converged: boolean
  spectralRadius: number
  canConverge: boolean
  executionTime: number
  totalIterations: number
  finalError: number
}

// Utility functions for matrix operations
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

// Calculate spectral radius for Gauss-Seidel iteration matrix
function calculateSpectralRadius(matrix: number[][]): number {
  const n = matrix.length

  // Decompose matrix: A = D + L + U
  const D = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => (i === j ? matrix[i][i] : 0))
    )

  const L = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => (i > j ? matrix[i][j] : 0))
    )

  const U = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => (i < j ? matrix[i][j] : 0))
    )

  // For Gauss-Seidel, T = -(D + L)^(-1) * U
  // We'll use a simpler approximation based on the diagonal dominance
  let maxRadius = 0

  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) continue

    let rowSum = 0
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        rowSum += Math.abs(matrix[i][j])
      }
    }
    const radius = rowSum / Math.abs(matrix[i][i])
    maxRadius = Math.max(maxRadius, radius)
  }

  return maxRadius
}

export function gaussSeidel(params: GaussSeidelParams): GaussSeidelResult {
  const startTime = performance.now()

  const { matrix, vector, initialGuess, tolerance, maxIterations } = params
  const n = matrix.length
  const iterations: GaussSeidelIteration[] = []

  // Check for zero diagonal elements
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) {
      throw new Error(
        `Elemento diagonal cero en la fila ${i + 1}. El método de Gauss-Seidel no puede continuar.`
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
    const xOld = [...x]

    // Gauss-Seidel iteration: x_i^(k+1) = (b_i - sum(a_ij * x_j^(k+1)) - sum(a_ij * x_j^(k))) / a_ii
    for (let i = 0; i < n; i++) {
      let sum = 0

      // Sum of already updated values (j < i)
      for (let j = 0; j < i; j++) {
        sum += matrix[i][j] * x[j]
      }

      // Sum of not yet updated values (j > i)
      for (let j = i + 1; j < n; j++) {
        sum += matrix[i][j] * x[j]
      }

      x[i] = (vector[i] - sum) / matrix[i][i]
    }

    // Calculate errors
    const error = vectorNorm(vectorSubtract(x, xOld))
    const relativeError = relativeErrorNorm(x, xOld)

    iteration++

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

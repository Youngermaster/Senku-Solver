export interface SORParams {
  matrix: number[][]
  vector: number[]
  initialGuess: number[]
  tolerance: number
  maxIterations: number
  relaxationFactor: number // omega (w)
}

export interface SORIteration {
  iteration: number
  x: number[]
  error: number
  relativeError: number
}

export interface SORResult {
  solution: number[]
  iterations: SORIteration[]
  converged: boolean
  spectralRadius: number
  canConverge: boolean
  executionTime: number
  totalIterations: number
  finalError: number
  relaxationFactor: number
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

// Matrix operations
function matrixInverse(matrix: number[][]): number[][] {
  const n = matrix.length
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n)
      .fill(0)
      .map((_, j) => (i === j ? 1 : 0)),
  ])

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k
      }
    }

    // Swap rows
    ;[augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]

    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular and cannot be inverted')
    }

    // Scale pivot row
    const pivot = augmented[i][i]
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i]
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
  }

  // Extract inverse matrix
  return augmented.map((row) => row.slice(n))
}

function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const n = a.length
  const m = b[0].length
  const p = b.length

  return Array(n)
    .fill(0)
    .map((_, i) =>
      Array(m)
        .fill(0)
        .map((_, j) => {
          let sum = 0
          for (let k = 0; k < p; k++) {
            sum += a[i][k] * b[k][j]
          }
          return sum
        })
    )
}

// Calculate spectral radius for SOR iteration matrix
function calculateSpectralRadius(matrix: number[][], omega: number): number {
  const n = matrix.length

  try {
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

    // Calculate (D - ωL)
    const DMinusOmegaL = Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => D[i][j] - omega * L[i][j])
      )

    // Calculate ((1-ω)D + ωU)
    const term2 = Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => (1 - omega) * D[i][j] + omega * U[i][j])
      )

    // T = (D - ωL)^(-1) * ((1-ω)D + ωU)
    const DMinusOmegaLInv = matrixInverse(DMinusOmegaL)
    const T = matrixMultiply(DMinusOmegaLInv, term2)

    // Approximate spectral radius using Gershgorin circles
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
  } catch (error) {
    // Fallback to simpler estimation if matrix operations fail
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

    return maxRadius * Math.abs(omega)
  }
}

export function sor(params: SORParams): SORResult {
  const startTime = performance.now()

  const {
    matrix,
    vector,
    initialGuess,
    tolerance,
    maxIterations,
    relaxationFactor,
  } = params
  const n = matrix.length
  const iterations: SORIteration[] = []
  const omega = relaxationFactor

  // Validate relaxation factor
  if (omega <= 0 || omega >= 2) {
    throw new Error(
      'El factor de relajación (ω) debe estar entre 0 y 2 para garantizar convergencia.'
    )
  }

  // Check for zero diagonal elements
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) {
      throw new Error(
        `Elemento diagonal cero en la fila ${i + 1}. El método SOR no puede continuar.`
      )
    }
  }

  // Calculate spectral radius
  const spectralRadius = calculateSpectralRadius(matrix, omega)
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

    // SOR iteration: x_i^(k+1) = (1-ω)x_i^(k) + (ω/a_ii)[b_i - sum(a_ij * x_j^(k+1)) - sum(a_ij * x_j^(k))]
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

      const newValue = (vector[i] - sum) / matrix[i][i]
      x[i] = (1 - omega) * x[i] + omega * newValue
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
    relaxationFactor: omega,
  }
}

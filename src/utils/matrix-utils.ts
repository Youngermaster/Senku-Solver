// Shared matrix and vector utilities for iterative methods

export function parseMatrixInput(input: string): number[][] {
  const rows = input
    .trim()
    .split('\n')
    .filter((row) => row.trim() !== '')
  return rows.map((row) => {
    const values = row
      .trim()
      .split(/\s+|,/)
      .filter((val) => val !== '')
    return values.map((val) => {
      const num = parseFloat(val)
      if (isNaN(num)) {
        throw new Error(`Valor inválido en la matriz: "${val}"`)
      }
      return num
    })
  })
}

export function parseVectorInput(input: string): number[] {
  const values = input
    .trim()
    .split(/\s+|,|\n/)
    .filter((val) => val.trim() !== '')
  return values.map((val) => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      throw new Error(`Valor inválido en el vector: "${val}"`)
    }
    return num
  })
}

export function validateMatrix(matrix: number[][]): void {
  if (matrix.length === 0) {
    throw new Error('La matriz no puede estar vacía')
  }

  const n = matrix.length
  if (n > 7) {
    throw new Error('La matriz no puede ser mayor a 7x7')
  }

  // Check if matrix is square
  for (let i = 0; i < n; i++) {
    if (matrix[i].length !== n) {
      throw new Error(
        `La matriz debe ser cuadrada. Fila ${i + 1} tiene ${matrix[i].length} elementos, esperado ${n}`
      )
    }
  }

  // Check for zero diagonal elements
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) {
      throw new Error(
        `Elemento diagonal cero en la posición (${i + 1}, ${i + 1}). Los métodos iterativos requieren elementos diagonales no nulos.`
      )
    }
  }
}

export function validateVector(vector: number[], matrixSize: number): void {
  if (vector.length !== matrixSize) {
    throw new Error(
      `El vector b debe tener ${matrixSize} elementos, pero tiene ${vector.length}`
    )
  }
}

export function formatMatrixDisplay(matrix: number[][]): string {
  return matrix
    .map((row) => row.map((val) => val.toFixed(6)).join('\t'))
    .join('\n')
}

export function formatVectorDisplay(vector: number[]): string {
  return vector.map((val) => val.toFixed(6)).join('\n')
}

export function generateExampleMatrix(size: number): {
  matrix: number[][]
  vector: number[]
} {
  const examples: Record<number, { matrix: number[][]; vector: number[] }> = {
    2: {
      matrix: [
        [4, -1],
        [-1, 4],
      ],
      vector: [3, 7],
    },
    3: {
      matrix: [
        [4, -1, 0],
        [-1, 4, -1],
        [0, -1, 4],
      ],
      vector: [3, 7, 6],
    },
    4: {
      matrix: [
        [10, -1, 2, 0],
        [-1, 11, -1, 3],
        [2, -1, 10, -1],
        [0, 3, -1, 8],
      ],
      vector: [6, 25, -11, 15],
    },
  }

  return examples[size] || examples[3]
}

export function checkDiagonalDominance(matrix: number[][]): {
  isDiagonallyDominant: boolean
  violations: string[]
} {
  const n = matrix.length
  const violations: string[] = []
  let isDiagonallyDominant = true

  for (let i = 0; i < n; i++) {
    const diagonal = Math.abs(matrix[i][i])
    let rowSum = 0

    for (let j = 0; j < n; j++) {
      if (i !== j) {
        rowSum += Math.abs(matrix[i][j])
      }
    }

    if (diagonal < rowSum) {
      isDiagonallyDominant = false
      violations.push(
        `Fila ${i + 1}: |${matrix[i][i].toFixed(3)}| < ${rowSum.toFixed(3)}`
      )
    }
  }

  return { isDiagonallyDominant, violations }
}

export function estimateOptimalOmega(matrix: number[][]): number {
  // Simple estimation for optimal omega in SOR
  // For many problems, omega ≈ 2 / (1 + sqrt(1 - ρ²))
  // where ρ is the spectral radius of the Jacobi iteration matrix

  const n = matrix.length
  let maxRatio = 0

  for (let i = 0; i < n; i++) {
    if (matrix[i][i] === 0) continue

    let rowSum = 0
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        rowSum += Math.abs(matrix[i][j])
      }
    }
    const ratio = rowSum / Math.abs(matrix[i][i])
    maxRatio = Math.max(maxRatio, ratio)
  }

  if (maxRatio >= 1) {
    return 1.0 // Conservative choice if not diagonally dominant
  }

  // Rough estimation
  const rho = maxRatio
  const optimal = 2 / (1 + Math.sqrt(1 - rho * rho))

  // Clamp between 1.0 and 1.9 for safety
  return Math.max(1.0, Math.min(1.9, optimal))
}

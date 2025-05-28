import numpy as np

def jacobi(A, b, x0, tol, max_iterations=100):
    n = A.shape[0]
    x = x0
    D = np.diag(A)
    R = A - np.diagflat(D)

    for k in range(max_iterations):
        x_new = (b - np.dot(R, x)) / D
        if np.linalg.norm(x_new - x, np.inf) / np.linalg.norm(x_new, np.inf) < tol:
            return x_new, k+1  # Return the solution and the number of iterations
        x = x_new

    return x, k+1  # If tolerance is not reached, return the last iteration

# Set the value of x for Caucacia
x_value = 11
tol = 0.01  # Tolerance of two significant figures

# Prepare the matrix A and vector b for the Jacobi method
A = np.array([[11 - x_value, 5, 6], [-2, 4, 1], [-1, -1, 4]])
b = np.array([15, 15, 20])
x0 = np.array([1, 1, 1])

# Run the Jacobi method for x = 11
try:
    solution, iterations = jacobi(A, b, x0, tol)
    print(f"La solución para x={x_value} es {solution} y el número de iteraciones es {iterations}")
except Exception as e:
    print(f"No se pudo encontrar una solución para x={x_value} debido a: {e}")

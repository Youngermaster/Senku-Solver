import numpy as np
import matplotlib.pyplot as plt

def jacobi(A, b, x0, tol, max_iterations=100):
    n = A.shape[0]
    x = x0
    D = np.diag(A)
    R = A - np.diagflat(D)

    for k in range(max_iterations):
        x_new = (b - np.dot(R, x)) / D
        if np.linalg.norm(x_new - x, ord=np.inf) / np.linalg.norm(x_new, ord=np.inf) < tol:
            return x_new, k+1  # Return the solution and the number of iterations
        x = x_new

    return x, k+1  # If tolerance is not reached, return the last iteration

# Define the range of x values
x_values = np.linspace(1, 10, 100)  # Let's say we are interested in values from 1 to 10
iterations_list = []

# Tolerance of two significant figures
tol = 1e-2

# Run the Jacobi method for each x value
for x_value in x_values:
    A = np.array([[11 - x_value, 5, 6], [-2, 4, 1], [-1, -1, 4]])
    b = np.array([15, 15, 20])
    x0 = np.array([1, 1, 1])
    
    try:
        _, iterations = jacobi(A, b, x0, tol)
        iterations_list.append(iterations)
    except Exception as e:
        # In case of an error, append a None or some indicator to signify the failure
        iterations_list.append(None)
        print(f"Jacobi method failed for x={x_value} with error: {e}")

# Plotting
plt.plot(x_values, iterations_list, marker='o')
plt.xlabel('x value')
plt.ylabel('Number of Iterations')
plt.title('Jacobi Method Convergence')
plt.grid(True)
plt.show()

import numpy as np

def f(x):
    return (np.pi ** -x) * (-1 + x) + x ** (2 / 3) - 10

def df(x):
    return (np.log(np.pi) * (np.pi ** -x) * (-1 + x)) / (np.pi ** x) + (2 * x ** (-1 / 3)) / 3

def newton_raphson(x0, tol=1e-6, max_iter=100):
    history = []
    for i in range(max_iter):
        x1 = x0 - f(x0) / df(x0)
        error = abs(x1 - x0)
        history.append((i, x1, f(x1), error))
        
        if error < tol:
            break
        x0 = x1
    return history

# Initial guess
x0 = 10

results = newton_raphson(x0)
for iteration, x_n, fx_n, error in results:
    print(f"Iteration {iteration + 1}: x_n = {x_n}, f(x_n) = {fx_n}, Error = {error}")

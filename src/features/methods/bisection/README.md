# Método de Bisección

## Descripción

El método de bisección es un algoritmo numérico para encontrar raíces de funciones continuas. Es un método robusto y garantiza la convergencia si se cumplen las condiciones iniciales.

## Principio

El método se basa en el teorema del valor intermedio: si una función continua f(x) cambia de signo en un intervalo [a, b], entonces existe al menos una raíz en ese intervalo.

## Algoritmo

1. **Verificar condiciones iniciales**: f(xi) × f(xs) < 0
2. **Calcular punto medio**: xm = (xi + xs) / 2
3. **Evaluar función en el punto medio**: f(xm)
4. **Determinar nuevo intervalo**:
   - Si f(xi) × f(xm) < 0, entonces xs = xm
   - Si no, entonces xi = xm
5. **Repetir hasta convergencia**

## Condiciones de Parada

- |f(xm)| < tolerancia
- |xm - xa| < tolerancia (donde xa es el valor anterior de xm)
- Número máximo de iteraciones alcanzado

## Ventajas

- **Convergencia garantizada** si se cumplen las condiciones iniciales
- **Robusto** y estable numéricamente
- **Simple** de implementar y entender

## Desventajas

- **Convergencia lenta** (lineal)
- Requiere que la función **cambie de signo** en el intervalo
- Solo encuentra **una raíz** por ejecución

## Uso en la Aplicación

### Parámetros de Entrada

- **Función f(x)**: Expresión matemática como string
- **Límite inferior (xi)**: Extremo izquierdo del intervalo
- **Límite superior (xs)**: Extremo derecho del intervalo
- **Tolerancia**: Error máximo aceptable
- **Máx. Iteraciones**: Número máximo de iteraciones

### Funciones Soportadas

- Operaciones básicas: `+`, `-`, `*`, `/`, `^` (potencia)
- Funciones trigonométricas: `Math.sin`, `Math.cos`, `Math.tan`
- Funciones exponenciales: `Math.exp`, `Math.log`
- Otras: `Math.sqrt`, `Math.abs`

### Ejemplo de Uso

```typescript
const result = bisectionMethod({
  xi: 0,
  xs: 1,
  tolerance: 0.0001,
  maxIterations: 100,
  functionExpression: 'x^2 - 5*x + 6*Math.sin(x)',
})
```

## Resultados

La función retorna un objeto con:

- **root**: Raíz aproximada encontrada
- **error**: Error absoluto de la última iteración
- **iterations**: Número de iteraciones realizadas
- **converged**: Indica si el método convergió
- **message**: Mensaje descriptivo del resultado
- **iterationData**: Tabla detallada de cada iteración

## Implementación

El algoritmo está implementado en TypeScript y se encuentra en:

- `src/utils/algorithms/bisection.ts`

Los componentes de la interfaz están en:

- `src/features/methods/bisection/`

import { Calculator, TrendingUp } from 'lucide-react'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import MethodCard from './method-card'

// Descriptions for each method
const methodDescriptions: Record<string, string> = {
  'Método de Bisección':
    'Método robusto que garantiza convergencia dividiendo sucesivamente el intervalo por la mitad. Ideal para funciones continuas que cambian de signo.',

  'Método de Punto Fijo':
    "Transforma f(x) = 0 en x = g(x) y aplica iteración directa. Converge cuando |g'(x)| < 1 en el intervalo de interés.",

  'Método de Regla Falsa':
    'Mejora la bisección usando interpolación lineal entre los extremos del intervalo. Generalmente converge más rápido que bisección.',

  'Método de Newton-Raphson':
    'Utiliza la tangente a la curva para aproximar la raíz. Ofrece convergencia cuadrática pero requiere calcular la derivada.',

  'Método de la Secante':
    'Similar a Newton-Raphson pero aproxima la derivada usando dos puntos. No requiere cálculo analítico de derivadas.',

  'Método de Raíces Múltiples':
    'Versión modificada de Newton-Raphson diseñada específicamente para encontrar raíces múltiples con convergencia cuadrática.',

  'Comparación de Métodos':
    'Herramienta de análisis que ejecuta todos los métodos con la misma función y compara su rendimiento, eficiencia y precisión.',

  // Iterative methods
  'Método de Jacobi':
    'Método iterativo básico para sistemas lineales Ax = b. Utiliza todos los valores de la iteración anterior. Garantiza convergencia para matrices diagonalmente dominantes.',

  'Método de Gauss-Seidel':
    'Mejora de Jacobi que usa los valores más recientes en cada iteración. Generalmente converge más rápido que Jacobi para el mismo sistema.',

  'Método de SOR':
    'Successive Over-Relaxation acelera la convergencia de Gauss-Seidel usando un factor de relajación ω. Puede ser hasta 2x más rápido con ω óptimo.',

  'Comparación Iterativa':
    'Ejecuta y compara Jacobi, Gauss-Seidel y SOR con la misma matriz. Analiza radio espectral, convergencia y rendimiento para identificar el mejor método.',

  // Interpolation methods
  'Método de Vandermonde':
    'Construye el polinomio interpolante resolviendo el sistema de Vandermonde. Método directo que garantiza interpolación exacta para puntos distintos.',

  'Método de Newton Interpolante':
    'Utiliza diferencias divididas para construir el polinomio interpolante en forma de Newton. Eficiente para agregar nuevos puntos.',

  'Método de Lagrange':
    'Construye el polinomio usando funciones base de Lagrange. Forma elegante que expresa directamente la contribución de cada punto.',

  'Spline Lineal':
    'Interpolación por tramos usando segmentos lineales. Simple y eficaz para datos con comportamiento suave entre puntos.',

  'Spline Cúbica':
    'Interpolación suave usando polinomios cúbicos por tramos. Garantiza continuidad de la función y sus primeras dos derivadas.',
}

const categoryDescriptions: Record<string, string> = {
  'Métodos de Raíces':
    'Algoritmos numéricos para encontrar raíces de ecuaciones no lineales',
  'Métodos Iterativos':
    'Técnicas iterativas para resolver sistemas de ecuaciones lineales Ax = b',
  'Métodos de Interpolación':
    'Construcción de funciones que pasan exactamente por puntos dados',
  Análisis:
    'Herramientas para comparar y evaluar el rendimiento de los métodos',
}

export default function MethodsGrid() {
  // Filter the methods groups (skip "Inicio")
  const methodGroups = sidebarData.navGroups.filter(
    (group) =>
      group.title === 'Métodos de Raíces' ||
      group.title === 'Métodos Iterativos' ||
      group.title === 'Métodos de Interpolación'
  )

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='space-y-4 text-center'>
        <div className='flex items-center justify-center gap-3'>
          <Calculator className='text-primary h-8 w-8' />
          <h1 className='text-3xl font-bold tracking-tight'>Senku Solver</h1>
        </div>
        <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
          Suite completa de métodos numéricos para análisis matemático. Explora
          diferentes algoritmos para encontrar raíces de ecuaciones no lineales,
          resolver sistemas de ecuaciones lineales e interpolación de datos.
        </p>
      </div>

      {/* Methods by Category */}
      {methodGroups.map((group) => (
        <div key={group.title} className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='text-primary h-5 w-5' />
              <h2 className='text-2xl font-semibold tracking-tight'>
                {group.title}
              </h2>
            </div>
            <p className='text-muted-foreground'>
              {categoryDescriptions[group.title] ||
                'Herramientas especializadas de análisis numérico'}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {group.items
              .filter((item) => item.url && item.icon) // Filter out items without required properties
              .map((item) => (
                <MethodCard
                  key={item.url}
                  title={item.title}
                  description={
                    methodDescriptions[item.title] ||
                    'Método de análisis numérico avanzado.'
                  }
                  url={item.url!} // Safe to use ! because we filtered above
                  icon={
                    item.icon! as React.ComponentType<{ className?: string }>
                  } // Type cast to match MethodCard expectation
                  category={group.title}
                />
              ))}
          </div>
        </div>
      ))}

      {/* Footer Info */}
      <div className='bg-muted/30 rounded-lg p-6 text-center'>
        <h3 className='mb-2 font-semibold'>¿Nuevo en análisis numérico?</h3>
        <p className='text-muted-foreground mb-4 text-sm'>
          Cada método incluye explicaciones detalladas, ejemplos prácticos y
          herramientas de comparación para ayudarte a entender su
          funcionamiento.
        </p>
        <div className='text-muted-foreground flex flex-wrap justify-center gap-4 text-xs'>
          <span>✓ Interfaz intuitiva</span>
          <span>✓ Tablas de iteraciones</span>
          <span>✓ Gráficas interactivas</span>
          <span>✓ Análisis de convergencia</span>
          <span>✓ Exportación de resultados</span>
        </div>
      </div>
    </div>
  )
}

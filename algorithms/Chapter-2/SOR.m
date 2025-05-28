%-----------------------------------------------------------------------
% SOR  : Sobre-Relajación Sucesiva
%        resuelve  A·x = b  a partir de x0, tolerancia Tol y factor w
%-----------------------------------------------------------------------
function [E,x] = SOR(x0,A,b,Tol,niter,w)

c     = 0;                 % contador de iteraciones
error = Tol + 1;           % fuerza la entrada al bucle

D =  diag(diag(A));
L = -tril(A,-1);
U = -triu(A, 1);

while error > Tol && c < niter

    T = (D - w*L)\((1-w)*D + w*U);
    C = w*(D - w*L)\b;

    x1 = T*x0 + C;

    % ----------  norma 2 del vector (x1 – x0) ./ x1  ----------
    diff     = (x1 - x0) ./ x1;     % vector requerido en el enunciado
    E(c+1)   = norm(diff,2);        % ***  NORMA 2  ***
    error    = E(c+1);

    x0 = x1;
    c  = c + 1;
end

x = x0;                               % solución final

if error < Tol
    fprintf('Convergió en %d iteraciones.\n',c);
else
    fprintf('Fracasó en %d iteraciones (tol = %.3e)\n',niter,Tol);
end
end

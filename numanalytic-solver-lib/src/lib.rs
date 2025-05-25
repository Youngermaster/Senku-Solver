use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[wasm_bindgen]
pub fn bisection_method(mut a: f64, mut b: f64, tolerance: f64, max_iterations: usize) -> f64 {
    let mut root = a;
    let mut iterations = 0;

    while (b - a) / 2.0 > tolerance && iterations < max_iterations {
        root = (a + b) / 2.0;
        if function_to_find_root(root) * function_to_find_root(a) > 0.0 {
            a = root;
        } else {
            b = root;
        }
        iterations += 1;
    }

    root
}

fn function_to_find_root(x: f64) -> f64 {
    // Example function: x^2 - 2
    x * x - 2.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}

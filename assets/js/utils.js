// Returns a function that calls each of the arguments of chain in sequence
// e.g., chain(fn1, fn2, fn3)  ->  function (...args) { fn1(...args); fn2(...args); fn3(...args); }
function chain(...fns) {
  return (...args) => fns.forEach((fn) => fn(...args));
}

// $.ajax(...).always(receiveAt(obj, 'prop')) will send an AJAX request that sets obj.prop to the response when it arrives
function receiveAt(obj, prop) {
  return (...args) => {
    let responseIndex = (args[1] === 'success') ? 2 : 0;
    let response = args[responseIndex]
    obj[prop] = response;
  }
}

// If `obj.prop` is defined (perhaps in the prototype) by a getter that must do some sort of expensive computation to return `val`, `memoize(obj, { prop: val })` can be used to record the value so it need not be recomputed next time. It then returns `val`.
function memoize(obj, propsToMemoize) {
  Object.keys(propsToMemoize).forEach((key) =>
    Object.defineProperty(obj, key, { value: propsToMemoize[key] }));
}
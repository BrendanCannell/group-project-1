// `$.ajax(...).always(receiveAt(obj, 'prop'))` will send an AJAX request that sets obj.prop to the response when it arrives
function receiveAt(obj, prop) {
  return (...args) => {
    let responseIndex = (args[1] === 'success') ? 2 : 0;
    let response = args[responseIndex]
    obj[prop] = response;
  }
}

// Wraps `obj` in a proxy that calls `callback` whenever `obj` is mutated
function observe(obj, callback) {
  return new Proxy(obj, {
    set: function(target, prop, value) {
      target[prop] = value;
      callback();
    } 
  })
}

// If `obj.prop` is defined by a getter that must do some expensive computation to return `val`, the getter can use `memoize(obj, { prop: val })` to record the value so it need not be recomputed next time.
function memoize(obj, propsToMemoize) {
  Object.keys(propsToMemoize).forEach((key) =>
    Object.defineProperty(obj, key, { value: propsToMemoize[key] }));
}
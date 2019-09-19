export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
export const pipe = (...fns) => fns.reduceRight((f, g) => (...args) => f(g(...args)));
export const curry = (fn, arity = fn.length, ...args) =>
    arity <= args.length ? fn(...args) : curry.bind(null, fn, arity, ...args);
export const bind = (fn, context) => (...args) => fn.apply(context, [...args]);
export const once = fn => {
    let called = false;
    return function(...args) {
        if (called) return;
        called = true;
        return fn.apply(this, args);
    };
};
export const map = curry((fn, arr) => arr.map(fn));
export const prop = curry((val, obj) => obj && obj[val] || undefined);
export const path = (values = []) => obj => values.reduce((acc, val) => acc && acc[val] || undefined, obj);
export const first = arr => arr && arr[0] || undefined;
export const last = arr => arr && arr[arr.length - 1] || undefined;
export const getByIndex = curry((index, arr) => arr && arr[index] || undefined);
export const trace = curry((label, val) => (console.log(label, val), val));
export const flip = curry((fn, a, b) => fn(b)(a));
export const invoke = (method, ...args) => context => context[method](...args);
const withConstructor = constructor => o => ({
    __proto__: {
        constructor
    },
    ...o
});
export const Functor = value => Object.assign(
    withConstructor(Functor)({}),
    {
        map(fn) { return this.constructor.of(fn(value)) },
        toString() { return `${this.constructor.name}(${value})` },
        valueOf: () => value
    }
);
Functor.of = Functor;

export const Monad = value => Object.assign(
    withConstructor(Monad)(Functor(value)),
    {
        chain: fn => fn(value),
    }
);
Monad.of = Monad;

const Nothing = () => ({
    isNothing: () => true,
    toString: () => 'Nothing()',
    map: fn => Nothing(),
    chain: fn => Nothing(),
    orElse: defaultProp => Maybe.of(defaultProp)
});
const Just = value => Object.assign(
    withConstructor(Just)(Monad(value)),
    {
        isNothing: () => false,
        orElse: fn => Nothing(),
    }
);
Just.of = Just;

export const Maybe = value => value ? Just(value) : Nothing();
Maybe.of = Maybe;
export const idX = x => x;
export const qs = document.querySelector.bind(document);
export const qsAll = document.querySelectorAll.bind(document);
export const convertingToArray = collection => collection ? [...collection] : null;
export const getElement = selector => compose(Maybe, qs)(selector);
export const getElements = selector => compose(Maybe, convertingToArray, qsAll)(selector);
export const setStyle = curry((key,val,elem) => ((elem.style[key] = val), elem));
export const setValue= curry((key,val,elem) => ((elem[key] = val), elem));
export const setAttribute = curry((key,val,elem) => ((elem.setAttribute(key, val)), elem));
export const hasAttribute = curry((key,elem) => elem.getAttribute(key));
export const getAttribute = curry((key,elem) => elem.getAttribute(key));
export const sum = (...args) => args.reduce((acc, num) => acc + num);
export const inequality = (...args) => args.reduce((acc, num) => acc - num);
export const setListener = curry((event,fn,elem) => (elem.addEventListener(event, fn), elem));
export const removeListener = curry((event,fn,elem) => (elem.removeEventListener(event, fn), elem));
export const addClass = curry((className, obj) => (obj.classList.add(className), obj));
export const hasClass = curry((className, elem) => elem && elem.classList.contains(className));
export const toggleClass = curry((className, elem) => elem.classList.toggle(className));
export const removeClass = curry((className, obj) => (obj.classList.remove(className), obj));
export const applyForEach = curry((fn, arr) => arr.forEach(fn));
export const split = curry((by, str) => str.split(by));
//getParent is only for clicks
export const getParent = curry((parentNodeName, target) => (
    target && target.nodeName !== parentNodeName
            ? getParent(parentNodeName)(target.parentElement)
            : target
));
export const activity = () => {
    let isActive = false;

    return {
        isActive: () => isActive,
        start() {
            isActive = true;
        },
        stop() {
            isActive = false;
        }
    }
};
export const sendData = value => {
    if (typeof __gaTracker === 'function') {
        try {
            __gaTracker.getAll().forEach(tracker => {
                tracker.send("event", value);
            });
        } catch {
            console.error('__gaTracker is not exist')
        }
    }
    return value;
};
export const setToLS = curry((key, value) => 
    Maybe(localStorage)
        .map(obj => obj.setItem(key, JSON.stringify(value))));

export const getFromLS = (key) =>
    Maybe(localStorage)
        .map(obj => {
            const data = obj.getItem(key);
            return data ? JSON.parse(data) : null})
        .valueOf();

export const fetcher = (url, fn) => {
    fetch(url)
    .then(response => response.json())
    .then(fn)
  };
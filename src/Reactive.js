export class Reactive {
  constructor(value) {
    if (Reactive.reactiveStore.has(value)) {
      return Reactive.reactiveStore.get(value)
    }

    const proxy = new Proxy(value, {
      get: (target, key) => {
        const value = target[key]

        return Reactive.toReactive(value)
      },
      set: (target, key, value) => {
        target[key] = value

        return true
      },
    })

    Reactive.reactiveStore.set(value, proxy)
    Reactive.rawStore.set(proxy, value)

    return proxy
  }
  static reactiveStore = new WeakMap()
  static rawStore = new WeakMap()
  static toReactive(value) {
    if (typeof value !== 'object' || !value) {
      return value
    }

    return new Reactive(value)
  }
  static toRaw(value) {
    return Reactive.rawStore.get(value)
  }
}

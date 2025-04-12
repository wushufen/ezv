export class NodeX extends Node {
  /**
   * @param {Node} node
   */
  constructor(node) {
    super()
    this.node = node

    return new Proxy(this, {
      get: (target, key) => {
        if (key in target) {
          return target[key]
        }
        return target.node?.[key]
      },
      set: (target, key, value) => {
        target.node[key] = value

        return true
      },
    })
  }
  node
  /**
   * @param {boolean} bool
   */
  if(bool) {}
  /**
   * @param {*} item
   */
  for(item) {}
}

import { Compiler } from './Compiler.js'
import { Reactive } from './Reactive.js'
import './VNode.js'

/** View Component */
export class View extends EventTarget {
  /**
   * @param {Node|string} html
   */
  constructor(html = '') {
    super()

    this.el = html instanceof Node ? html : Compiler.parse(html)
  }
  el
  _scope = {}
  // Reactive.toReactive(scope)
  scope = new Proxy(this, {
    has(target, key) {
      return true
    },
    get(target, key) {
      return (key in target._scope ? target._scope : window)[key]
    },
    set(target, key, value) {
      // console.warn('set', { target, key, value })
      target._scope[key] = value

      target.update()
      return true
    },
  })
  lastRenderPromiseReject = () => {}
  create = () => {
    this.create = /**@type {()=>void} */ (Function(Compiler.compile(this.el)))
    this.create()
  }
  render = () => {
    return { skip: true }
  }
  /**
   * @param {VNode} vNode
   * @example
   * childNodes:
   *      if 1 -   0 if
   *    text         text
   *  elseif 0   + 1 elseif
   *    text         text
   *    else 0     0 else
   *    text         text
   *    for# 1 \ / 2 for#
   *    for# 2 / \ 1 for#
   *    for# 3 - + 5 text
   *    for# 4 -     text
   *    text
   */
  diff(vNode) {
    const createNode = View.createNode
    console.log('diff', { el: this.el, vNode })
    console.groupCollapsed('patch')
    patch(this.el, vNode)
    console.groupEnd()
    console.warn('render', this.render)

    /**
     * @param {Node} node
     * @param {VNode=} vNode
     * @param {Node?=} parentNode
     */
    function patch(node, vNode, parentNode = node.parentNode) {
      // console.log('patch', { node, vNode, parentNode })
      if (!parentNode) return
      if (vNode?.skip) return

      // +
      if (!node && vNode) {
        parentNode.appendChild(createNode(vNode))
        return
      }
      // -
      if (node && !vNode) {
        parentNode.replaceChild(createNode({ nodeName: '#comment' }), node)
        return
      }
      // +-
      if (!(node && vNode)) return
      if (node.nodeName !== vNode.nodeName) {
        parentNode.replaceChild(createNode(vNode), node)
        return
      }

      // props
      for (const key in vNode.props) {
        if (node[key] !== vNode.props[key]) {
          node[key] = vNode.props[key]
        }
      }

      // childNodes
      const childNodes = node.childNodes
      const vChildNodes = vNode.childNodes || []
      const maxLength = Math.max(childNodes.length, vChildNodes.length)
      for (let i = 0; i < maxLength; i++) {
        const child = childNodes[i]
        const vChild = vChildNodes[i]
        patch(child, vChild, node)
      }
    }
  }
  update() {
    this.diff(this.render())
  }
  /**
   * @param {Element=} target
   */
  mount(target) {
    if (target) {
      const shadowRoot =
        target.shadowRoot || target.attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = ''
      shadowRoot.replaceChildren(...this.el.childNodes)
    }

    this.create()
    this.update()
  }
  unmount() {}
  /**
   * @param {VNode} vNode
   */
  static createNode(vNode) {
    const { nodeName = '', props = {}, childNodes = [] } = vNode

    /**@type Node */
    const node =
      {
        get '#text'() {
          return document.createTextNode(props.nodeValue ?? '')
        },
        get '#comment'() {
          return document.createComment(props.nodeValue ?? '')
        },
      }[nodeName] || document.createElement(nodeName)

    if (childNodes) {
      childNodes.forEach((child) => {
        node.appendChild(View.createNode(child))
      })
    }

    return node
  }
}

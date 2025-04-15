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

      target.lastRenderPromiseReject()
      new Promise((resolve, reject) => {
        target.lastRenderPromiseReject = reject
        resolve(true)
      }).then(() => {
        target.render()
      })

      return true
    },
  })
  lastRenderPromiseReject = () => {}
  create = () => {
    this.create = /**@type {()=>void} */ (Function(Compiler.compile(this.el)))
    this.create()
  }
  render = () => {
    // this.diff({})
  }
  /**
   * @param {VNode} vNode
   */
  diff(vNode) {
    const createNode = View.createNode
    // console.log('diff', { el: this.el, vNode })
    // console.groupCollapsed('patch')
    patch(this.el, vNode)
    // console.groupEnd()
    console.log('render', this.render)

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
      const childNodes = [...node.childNodes]
      const vChildNodes = vNode.childNodes || []
      const maxLength = Math.max(childNodes.length, vChildNodes.length)
      // console.log('child', { childNodes, vChildNodes, maxLength })
      for (let i = 0; i < maxLength; i++) {
        patch(childNodes[i], vChildNodes[i], node)
      }
    }
  }
  /**
   * @param {Element} target
   */
  mount(target) {
    const shadowRoot =
      target.shadowRoot || target.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = ''
    shadowRoot.replaceChildren(...this.el.childNodes)

    this.create()
    this.render()
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

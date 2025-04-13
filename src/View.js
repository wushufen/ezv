import { Compiler } from './Compiler.js'
import { Reactive } from './Reactive.js'

export class View extends EventTarget {
  /**
   * @param {Node|string} html
   */
  constructor(html = '') {
    super()

    this.el = html instanceof Node ? html : Compiler.parse(html)
    this.create = Function(Compiler.compile(this.el))
  }
  el
  _scope = {}
  // Reactive.toReactive(scope)
  scope = new Proxy(this, {
    has(target, key) {
      return key in target._scope
    },
    get(target, key) {
      return target._scope[key]
    },
    set(target, key, value) {
      target._scope[key] = value
      const rs = target.render()
      console.log('set', rs)
      return true
    },
  })
  /**@type Function */
  create = () => {}
  /**@type Function */
  render = () => {}
  diff(vNode) {
    console.log('render', this.render)
    console.log('diff', JSON.stringify(vNode, null, 2))
    const createNode = View.createNode

    patch(this.el, vNode)
    /**
     * @param {Node} node
     * @param {any} vNode
     * @param {Node?} parentNode
     */
    function patch(node, vNode, parentNode = node.parentNode) {
      console.log('patch', { node, vNode, parentNode })
      if (!parentNode) return

      let newNode = node

      // +
      if (!node && vNode) {
        const newNode = createNode(vNode)
        parentNode.appendChild(newNode)
        return
      }
      // -
      if (node && !vNode) {
        const newNode = createNode({
          nodeName: '#text',
          props: { nodeValue: '' },
          childNodes: [],
        })
        parentNode.replaceChild(newNode, node)
        return
      }
      // +-
      if (node.nodeName !== vNode.nodeName) {
        const newNode = createNode(vNode)
        parentNode.replaceChild(newNode, node)
        return
      }

      // props
      Object.assign(node, vNode.props)

      // childNodes
      var childNodes = [...node.childNodes]
      var newChildren = vNode?.childNodes || []
      var maxLength = Math.max(childNodes.length, newChildren.length)
      for (var i = 0; i < maxLength; i++) {
        console.log('child', { childNodes, newChildren, maxLength, i })
        patch(childNodes[i], newChildren[i], node)
      }
    }
  }
  static createNode(vNode) {
    const { nodeName, props, childNodes } = vNode
    const node =
      nodeName === '#text'
        ? document.createTextNode(props.nodeValue)
        : document.createElement(nodeName)

    if (childNodes) {
      childNodes.forEach((child) => {
        node.appendChild(View.createNode(child))
      })
    }

    return node
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
}

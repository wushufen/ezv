export class VNode {
  /**
   * @param {Node|Partial<VNode>} node
   */
  constructor(node = document.documentElement) {
    if (!(node instanceof Node)) {
      Object.assign(this, node)
      return this
    }

    this.nodeName = node.nodeName

    // if..else, for
    if (node instanceof Element) {
      // if="(bool)"
      this.if = node.getAttribute(VNode.ifKey) || ''
      // else
      this.else = node.getAttribute(VNode.elseKey) || ''
      // for="(const item of list)"
      this.for = node.getAttribute(VNode.forKey) || ''
    }

    // props
    if (node instanceof Element) {
      for (const attr of node.attributes) {
        const name = attr.nodeName
        const value = attr.nodeValue
        if (name.startsWith('.')) {
          this.props[name.slice(1)] = value
        }
      }
    }

    // ${}
    if (node instanceof Text) {
      if (node.nodeValue?.trim()?.match(/\$\{/)) {
        this.props.nodeValue = '`' + node.nodeValue + '`'
      }
    }

    // > childNodes
    for (const child of node.childNodes) {
      this.childNodes.push(new VNode(child))
    }
  }
  nodeName = ''
  if = ''
  else = ''
  for = ''
  props = {}
  /** @type {VNode[]} */
  childNodes = []
  render = () => []
  toString() {
    // nodeName, if..else, for
    let code = `nodeName:'${this.nodeName}'`
    if (this.for) code += `,for:'${this.for}'`
    if (this.if) code += `,if:'${this.if}'`
    if (this.else) code += `,else:'${this.else}'`

    // props
    let propsCode = Object.entries(this.props)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    // childNodes
    let childNodesCode = this.childNodes
      .map((child) => `${child.toString()}`)
      .join(',\n')
    if (childNodesCode) childNodesCode = `, [\n${childNodesCode}]`

    return `N({${code}}, {${propsCode}}${childNodesCode})`
  }
  toRender() {
    return Function(`return ${this.toString()}`)
  }
  static ifKey = 'if'
  static elseKey = 'else'
  static forKey = 'for'
  static create(options) {}
}

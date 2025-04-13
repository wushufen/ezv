export class Compiler {
  /**
   * @param {Node|string} node
   */
  static compile(node = document.documentElement) {
    if (typeof node === 'string') node = Compiler.parse(node)

    let script = ''
    let template = this.compileNode(node)

    return `return ${template}`
  }
  /** @param {Node} node*/
  static compileNode(node) {
    let code = ''
    code += `{
      nodeName: '${node.nodeName}',
      props: ${this.compileProps(node)},
      childNodes: [${this.compileChildNodes(node)}]
}`

    /** if..else
      (()=>{
        if(bool){
          return {}
        } else if(bool) {
          return {}
        } else {
          return {}
        }
      })()
      */
    if (node instanceof Element) {
      // else if => else-if
      if (node.hasAttribute('if') && node.hasAttribute('else')) {
        node.setAttribute('else-if', node.getAttribute('if') || '')
        node.removeAttribute('if')
        node.removeAttribute('else')
      }

      const ifAttr = node.getAttribute('if')
      const elseIfAttr = node.hasAttribute('else-if')
      const elseAttr = node.hasAttribute('else')

      if (ifAttr) {
        code = `(()=>{
          if(${ifAttr}){
            return ${code}
          }

          ${(() => {
            let code = ''

            // else if, else
            const nextSibling = node.nextElementSibling

            return code
          })()}
          
          return {/* if */}
        })()
        `
      } else if (elseIfAttr) {
        if (node['#fromIf']) {
          code = `else if(bool) {
            return ${code}
          }`
        } else {
          code = `{/* else if */}`
        }
      } else if (elseAttr) {
        if (node['#fromIf']) {
          code = ` else {
            return ${code}
          }`
        } else {
          code = `{/* else */}`
        }
      }
    }

    /** for
    ...(function* () {
      for (const item of list) {
          yield {}
      }
    })()
    */
    if (node instanceof Element) {
      const forAttr = node.getAttribute('for')
      if (forAttr) {
        code = `
          ...(function* () {
            for (const item of list) {
              yield ${code}
            }
          })()
        `
      }
    }

    return code
  }
  /** @param {Node} node*/
  static compileProps(node) {
    let code = ''
    code += `{`
    if (node instanceof Element) {
      for (const attr of node.attributes) {
        const name = attr.nodeName
        const value = attr.nodeValue
        if (name.startsWith('.')) {
          code += `${name.slice(1)}:${value}, `
        }
      }
    }
    // nodeValue: `${}`
    if (node instanceof Text) {
      if (node.nodeValue?.trim()?.match(/\$\{/)) {
        code += 'nodeValue: `' + node.nodeValue + '`'
      }
    }
    code += `}`
    return code
  }
  /** @param {Node} node*/
  static compileChildNodes(node) {
    return [...node.childNodes]
      .map((child) => this.compileNode(child))
      .join(',\n')
  }

  static parse(html = '') {
    const container = document.createElement('div')
    container.innerHTML = html
    const fragment = new DocumentFragment()
    fragment.append(...container.childNodes)
    return fragment
  }
}

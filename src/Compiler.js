export class Compiler {
  /**
   * @param {Node|string} node
   */
  static compile(node = document.documentElement) {
    if (typeof node === 'string') node = Compiler.parse(node)

    let script = ''
    const template = compileNode(node)

    /**
     *
     * @param {Node} node
     * @param {boolean} process 含流程
     */
    function compileNode(node, process = true) {
      if (node instanceof HTMLScriptElement) {
        script += node.innerHTML + '\n'
        return `{ nodeName: 'script', skip: true }`
      }

      if (node instanceof Text) {
        if (node.nodeValue?.trim()) {
          const value =
            node.nodeValue?.replace(/[`\\]/g, '\\$&')?.replace(/\n/g, '\\n') ??
            ''
          return `{ nodeName: '#text', props: { nodeValue: \`${value}\` } }`
        }
        return `{ nodeName: '#text', skip: true }`
      }

      if (node instanceof Element) {
        const ifAttr = node.getAttribute('if')
        const elseIfAttr = node.getAttribute('elseif')
        const elseAttr = node.hasAttribute('else')
        const forAttr = node.getAttribute('for')

        if (ifAttr && process) {
          return `
            (() => {
              if (${ifAttr}) {
                return (\n${compileNode(node, false)})
              }
            })()
          `
        }
        if (elseIfAttr && process) {
          return `{ nodeName: '#comment', nodeValue: 'elseif', skip: false }`
        }
        if (elseAttr && process) {
          return `{ nodeName: '#comment', nodeValue: 'else', skip: false }`
        }

        if (forAttr && process) {
          return `
            ...(function* () {
              for (${forAttr}) {
                yield (${
                  !ifAttr ? '' : `!( ${ifAttr} ) ? undefined : `
                }\n${compileNode(node, false)})
              }
            })()
          `
        }

        let code = '{'
        code += ifAttr ? ` if: true,` : ''
        code += elseIfAttr ? ` elseif: true,` : ''
        code += elseAttr ? ` else: true,` : ''
        code += forAttr ? ` for: true,` : ''
        code += ` nodeName: '${node.nodeName}',`
        code += ` props: {${compileProps()}},`
        function compileProps() {
          if (!(node instanceof Element)) return ''
          let code = ''
          for (const attr of node.attributes) {
            const name = attr.nodeName
            const value = attr.nodeValue
            if (name.startsWith('.')) {
              code += `${name.slice(1)}:${value}, `
            }
          }
          return code
        }
        code += ` childNodes: [\n`
        for (const child of node.childNodes) {
          const childCode = compileNode(child)
          if (!childCode) continue
          code += childCode + ',\n'
        }
        code += `]}`
        return code
      }

      return `{ nodeName: '${node.nodeName}', nodeType: ${node.nodeType}, skip: true }`
    }

    return `
    with (this.scope) {
      ${script
        // let x = 1 // this.scope.x = 1
        // TODO 排除局部变量
        .replace(/\b(?:var|let|const)\s+(\S+)/g, 'this.scope.$1')}
    
    
      this.render = () => {
        return this.diff(${template})
      }
    }
    `
  }
  static parse(html = '') {
    const container = document.createElement('div')
    container.innerHTML = html
    const fragment = new DocumentFragment()
    fragment.append(...container.childNodes)
    return fragment
  }
}

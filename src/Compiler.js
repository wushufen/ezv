export class Compiler {
  /**
   * @param {Node|string} node
   */
  static compile(node = document.documentElement) {
    if (typeof node === 'string') node = Compiler.parse(node)

    let script = ''
    let template = ''

    loop(node)
    function loop(/**@type Node*/ node) {
      if (node instanceof HTMLScriptElement) {
        script += node.innerHTML
        template += `{ nodeName: 'script', childNodes: [] },`
        return
      }

      if (node instanceof Text) {
        // if (!node.nodeValue?.trim()) return
        template += `{ nodeName: '#text', props: { nodeValue: \`${node.nodeValue}\` }, childNodes: [] },`
        return
      }

      if (node instanceof Element) {
        const ifAttr = node.getAttribute('if')
        const elseAttr = node.hasAttribute('else')
        const forAttr = node.getAttribute('for')

        if (forAttr) {
          template += `
          ...(function* () {
            for (const item of list) {
              yield`
        }

        if (ifAttr) {
          template += `(() => {
            if (bool) {
              return `
        }

        // if (elseAttr) {
        //   template += ` else {
        //     return `
        // }

        template += `{`
        template += `  nodeName: '${node.nodeName}',`
        template += `  props: {${getPropsCode()}},`
        function getPropsCode() {
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

        template += `  childNodes: [`
        for (const child of node.childNodes) {
          loop(child)
        }
        template += `  ],`
        template += `}`

        if (ifAttr) {
          template += `
          }
        })()`
        }

        // if (elseAttr) {
        //   template += `}`
        // }

        if (forAttr) {
          template += `
            }
          })()`
        }

        template += `,\n`
        return
      }

      template += `{ nodeName: '#text', props: { nodeValue: '' }, childNodes: [] },`
    }

    template = template.replace(/,\n$/, '')
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

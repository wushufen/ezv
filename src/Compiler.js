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
              ${(() => {
                let code = ''

                let next = node.nextElementSibling
                while (next && next.hasAttribute('elseif')) {
                  code += `else if (${next.getAttribute('elseif')}) {
                    return (\n${compileNode(next, false)})
                  }`
                  next = next.nextElementSibling
                }

                return code
              })()}
              ${(() => {
                let next = node.nextElementSibling
                while (next) {
                  if (next.hasAttribute('elseif')) {
                    next = next.nextElementSibling
                    continue
                  } else if (next.hasAttribute('else')) {
                    return `else {
                      return (\n${compileNode(next, false)})
                    }`
                  }
                  break
                }
              })()}
            })()
          `
        }
        if (elseIfAttr && process) {
          return `{ nodeName: '#text', elseif: true, skip: false }`
        }
        if (elseAttr && process) {
          return `{ nodeName: '#text', else: true, skip: false }`
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

      return `{ nodeName: '${node.nodeName}', skip: true }`
    }

    script = compileScript(script)
    function compileScript(script = '') {
      const reg =
        // /*     1     */ |  // 2  | "     3    " | '     4    ' | `5|     ${6 |  {7|8}  |   var 9
        /(\/\*[\s\S]*?\*\/)|(\/\/.*)|("(?:\\?.)*?")|('(?:\\?.)*?')|(`)|(\\?\$\{)|(\{)|(\})|\b(var|let|const)\b/g

      const stack = []
      return script.replace(reg, (...ms) => {
        const m = ms[0]
        const last = stack.at(-1)

        // ` `
        if (m === '`' && last !== '`') stack.push(m)
        if (m === '`' && last === '`') stack.pop()

        // ${ }
        if (m === '${' && last === '`') stack.push(m)
        if (m === '}' && last === '${') stack.pop()

        // { }
        if (m === '{' && last !== '`') stack.push(m)
        if (m === '}' && last !== '`') stack.pop()

        // let {x, y} = this // => 'let', {x, y} = this
        if (ms[9] && !stack.length) {
          return `'${m}', `
        }

        return m
      })
    }

    return `
    with (this.scope) {
      ${script}

      this.render = () => {
        return (${template})
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

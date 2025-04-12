/**
 * @example <caption>html</caption>
 * ```html
 * <script>
 *   const propX = this.props.propX
 *
 *   const list = [1, 2, 3]
 *   let bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 * </script>
 *
 *  <!-- if (bool) -->
 * <div>if</div>
 *  <!-- else if (bool) -->
 * <div>else if</div>
 *  <!-- else -->
 * <div>else</div>
 *
 *  <!-- for (const item of list) -->
 * <div>${ item }</div>
 *
 * <div .title="'string'" .onclick="alert">
 *   text: ${ 'string' }
 * </div>
 * ```
 *
 * @example <caption>js</caption>
 * ```js
 * // this.create
 * with(this.scope) {
 *   this.scope.propX = this.props.propX
 *
 *   this.scope.list = [1, 2, 3]
 *   this.scope.bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 *
 *   this.render = () => {
 *     if (bool) {
 *       html += `<div>if</div>`
 *     } else if (bool) {
 *       html += `<div>else if</div>`
 *     } else {
 *       html += `<div>else</div>`
 *     }
 *
 *     for (const item of list) {
 *       html += `<div>${ item }</div>`
 *     }
 *
 *     // 得换成虚拟 DOM ，函数变成了字符串
 *     html += `<div .title="${'string'}" .onclick="${alert}">
 *       text: ${ 'string' }
 *     </div>`
 *   }
 * }
 * ```
 *
 * @example <caption>js</caption>
 * ```js
 * // this.create
 * with(this.scope) {
 *   this.scope.propX = this.props.propX
 *
 *   this.scope.list = [1, 2, 3]
 *   this.scope.bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 *
 *   this.render = () => {
 *     // 无法满足只有 if(false)
 *     if(bool) {
 *       this.$(`<div>if</div>  #ID`).if(bool)
 *     }
 *     else if(bool) {
 *       this.$(`<div>else if</div>  #ID`).if(bool)
 *     }
 *     else {
 *       this.$(`<div>else</div>  #ID`).if(true)
 *     }
 *
 *     // 无法满足 list = []
 *     for(const item of list){
 *       this.$(`<div>${ item }</div>  #ID`).for(item)
 *       this.$(`${ item }  #ID`).textContent = `${ item }`
 *     }
 *
 *     this.$(`<div .title="'title'" .onclick="alert"></div>  #ID`).title = 'title'
 *     this.$(`<div .title="'title'" .onclick="alert"></div>  #ID`).onclick = alert
 *
 *     this.$(`text: ${'string' }  #ID`).textContent = ` text: ${'string' } `
 *   }
 * }
 * ```
 *
 * @example <caption>js</caption>
 * ```js
 * // this.create
 * with(this.scope) {
 *   this.scope.propX = this.props.propX
 *
 *   this.scope.list = [1, 2, 3]
 *   this.scope.bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 *
 *   this.render = () => {
 *
 *
 *     if(_(bool, `<div>if</div>  #ID`)) {
 *
 *     }
 *     else if(_(bool, `<div>else if</div>  #ID`)) {
 *
 *     }
 *     else {_(true, `<div>else</div>  #ID`)
 *
 *     }
 *
 *     for(const item of $$(list, `<div>${ item }</div>  #ID`)){
 *       $(`${ item }  #ID`).textContent = `${ item }`
 *     }
 *
 *     $(`<div .title="'title'" .onclick="alert"></div>  #ID`).title = 'title'
 *     $(`<div .title="'title'" .onclick="alert"></div>  #ID`).onclick = alert
 *
 *     $(`text: ${'string' }  #ID`).textContent = ` text: ${'string' } `
 *   }
 * }
 * ```
 *
 * @example <caption>js</caption>
 * ```js
 * // this.create
 * with(this.scope) {
 *   this.scope.propX = this.props.propX
 *
 *   this.scope.list = [1, 2, 3]
 *   this.scope.bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 *
 *   this.render = () => {
 *
 *
 *     this.$(`<div>if</div>  #ID`).if()
 *     if(bool) {
 *
 *     }
 *     else if(bool) {
 *
 *     }
 *     else {
 *
 *     }
 *
 *     this.$(`<div>${ item }</div>  #ID`).for()
 *     for(const item of list){
 *       $(`${ item }  #ID`).textContent = `${ item }`
 *     }
 *
 *     $(`<div .title="'title'" .onclick="alert"></div>  #ID`).title = 'title'
 *     $(`<div .title="'title'" .onclick="alert"></div>  #ID`).onclick = alert
 *
 *     $(`text: ${'string' }  #ID`).textContent = ` text: ${'string' } `
 *   }
 * }
 * ```
 *
 * @example <caption>js</caption>
 * ```js
 * // this.create
 * with(this.scope) {
 *   this.scope.propX = this.props.propX
 *
 *   this.scope.list = [1, 2, 3]
 *   this.scope.bool = true
 *
 *   setTimeout(() => {
 *     bool = false
 *   }, 3000)
 *
 *   this.render = () => {
 *     if(this.$('el').if(bool)){
 *     }
 *
 *     this //
 *       .if(bool, `<div>if</div>  #ID`, ()=>{
 *
 *       })
 *       .else_if(bool, `<div>else if</div>  #ID`, ()=>{
 *
 *       })
 *       .else(`<div>else</div>  #ID`, ()=>{
 *
 *       })
 *
 *     this //
 *       .for(list, `<div>${ item }</div>  #ID`, (item, index) => {
 *
 *       })
 *
 *     this
 *       .$(`<div .title="'title'" .onclick="alert"></div>  #ID`).title = 'title'
 *     this
 *       .$(`<div .title="'title'" .onclick="alert"></div>  #ID`).onclick = alert
 *
 *     this
 *       .$(`text: ${'string' }  #ID`).textContent = ` text: ${'string' } `
 *   }
 * }
 * ```
 */
export class Compiler {
  /**
   * @param {Element | DocumentFragment | string} html
   */
  static compile(html) {
    if (typeof html === 'string') html = Compiler.parse(html)

    let script = ''
    let template = ''
    loopNode(html)

    /**
     * @param {Partial<DocumentFragment & Comment & Element & Text & Attr>} node
     */
    function loopNode(node) {
      const id = { toString: () => Compiler.getNodeId(node) }
      const _prop = Compiler._prop

      // skip
      if (node instanceof HTMLStyleElement) return
      if (node instanceof HTMLScriptElement && node.type == 'module') return

      // script
      if (node instanceof HTMLScriptElement) {
        script += node.innerHTML || ''
        return
      }

      // if ... else if ... else, for
      if (node instanceof Comment) {
        const value = String(node.nodeValue).trim().replace(/\s+/g, ' ')
        const next = node.nextElementSibling
        template += `\n// <!-- ${value} -->\n`
        if (!next) return
        _prop(next, 'if', value.match(/^\s*if\s*\((.*)\)\s*$/))
        _prop(next, 'else_if', value.match(/^\s*else\s+if\s*\((.*)\)\s*$/))
        _prop(next, 'else', value.match(/^\s*else\s*$/))
        _prop(
          next,
          'for',
          value.match(/^\s*for\s*\(\s*const\s+(.*?)\s+of\s+(.*?)\s*\)\s*$/)
        )
      }
      if (_prop(node, 'if')) {
        const bool = _prop(node, 'if')[1]
        template += `this.if(${bool}, '${id}', () => {\n`
        loopAttrsChildNodes()
        template += `})\n`
        return
      }
      if (_prop(node, 'else_if')) {
        const bool = _prop(node, 'else_if')[1]
        template += `.else_if(${bool}, '${id}', () => {\n`
        loopAttrsChildNodes()
        template += `})\n`
        return
      }
      if (_prop(node, 'else')) {
        template += `.else('${id}', () => {\n`
        loopAttrsChildNodes()
        template += `})\n`
        return
      }
      if (_prop(node, 'for')) {
        const list = _prop(node, 'for')[2]
        const item = _prop(node, 'for')[1]
        template += `this.for(${list}, '${id}', (${item}) => {\n`
        loopAttrsChildNodes()
        template += `})\n`
        return
      }

      // attributes, childNodes
      loopAttrsChildNodes()
      function loopAttrsChildNodes() {
        loopNodes(node.attributes)
        loopNodes(node.childNodes)
      }

      // .prop
      if (node instanceof Attr && node.ownerElement) {
        const m = node.nodeName?.match(/\.(.*)/)
        if (!m) return
        const ownerId = Compiler.getNodeId(node.ownerElement)
        const prop = m[1]
        const value = node.nodeValue
        template += `  this.$('${ownerId}').${prop} = ${value}\n`
        return
      }

      // ${}
      if (node instanceof Text) {
        const m = node.nodeValue?.match(/.*\$\{(.*?)\}.*/g)
        if (!m) return
        template += `  this.$('${id}').textContent = \`${m[0]}\`\n`
        return
      }
    }

    function loopNodes(nodes) {
      for (const node of nodes || []) loopNode(node)
    }

    return `
    with(this.scope) {
      ${script
        // let x = 1 // this.scope.x = 1
        // TODO 排除局部变量
        .replace(/\b(?:var|let|const)\s+(\S+)/g, 'this.scope.$1')}
    
      this.render = () => {\n${template}\n}
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
  /**
   * @param {Partial<DocumentFragment & Comment & Element & Text & Attr>} node
   */
  static getNodeId(node) {
    /**@type string */
    let id = node['_ezv_id']
    if (!id) {
      const string = (
        node.cloneNode?.(node.childNodes?.length == 1)?.['outerHTML'] ||
        node.nodeValue ||
        String(node)
      )
        .replace(/\s+/g, ' ')
        .replace(/'/g, '\uFF07')
        // .replace(/\$\{/g, '\uFF04{')
        .replace(/(.{30}).*/, '$1…')

      id = `${string}  #${this.createId()}`
      this._prop(node, 'id', id)
    }
    return id
  }
  static createId() {
    let id = 1

    this.createId = createId
    function createId() {
      return id++
    }

    return createId()
  }
  static _prop(node, key, value) {
    const prefix = '_ezv_'
    key = `${prefix}${key}`

    if (arguments.length > 2) {
      node[key] = value

      Object.defineProperty(node, key, {
        value,
        enumerable: false,
      })
      return
    }

    return node[key]
  }
}

import { Compiler } from './Compiler.js'
import { Reactive } from './Reactive.js'
import { NodeX } from './NodeX.js'

export class View extends EventTarget {
  /**
   *
   * @param {Element | DocumentFragment | string} html
   * @returns
   */
  constructor(html = '') {
    super()
    let code = ''

    if (typeof html == 'string') {
      const fragment = Compiler.parse(html)
      this.childNodes = [...fragment.childNodes]
      code = Compiler.compile(fragment)
    } else if (html instanceof Element) {
      this.childNodes = [...html.childNodes]
      code = Compiler.compile(html)
    }

    this.create = Function(code)

    return Reactive.toReactive(this)
  }
  /**
   * @type {Node[]}
   */
  childNodes = []
  scope = new Proxy(
    {},
    {
      // true 表示必须在 with 的对象中取，不存在则摄氏，是否可以提升性能待验证
      has() {
        return true
      },
      get(target, key) {
        return target[key]
      },
      set(target, key, value) {
        target[key] = value
        return true
      },
    }
  )
  props = {}
  /**@type Function */
  create = () => {}
  $ = (id) => {
    return new NodeX()
  }
  /**
   * @param {Element} target
   */
  mount(target) {
    const shadowRoot =
      target.shadowRoot || target.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = ''
    shadowRoot.replaceChildren(...this.childNodes)

    this.create()
  }
  render() {}
  unmount() {}
}

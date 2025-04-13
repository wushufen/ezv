import { Compiler } from './Compiler.js'
import { Reactive } from './Reactive.js'

export class View extends EventTarget {
  /**
   * @param {Node|string} html
   */
  constructor(html = '') {
    super()
    let wrapper = html instanceof Node ? html : Compiler.parse(html)

    this.create = Function(Compiler.compile(wrapper))
    this.childNodes = [...wrapper.childNodes]

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
  /**@type Function */
  // create = () => {}
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

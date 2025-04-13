/* eslint-disable */
// @ts-nocheck
const html = `
    <script>
      const list = [1, 2, 3]
      let bool = true

      setTimeout(() => {
        bool = false
      }, 3000)
    </script>

    <div if="bool">if</div>
    <div else if="bool">else if</div>
    <div else>else</div>

    <ul>
      <li for="const item of list">\${ item }</li>
    </ul>

    <div .title="1 + 1" .onclick="alert">\${ 'string' }</div>
`

const view = {
  scope: {},
  create() {
    with (this.scope) {
      this.scope.list = [1, 2, 3]
      this.scope.bool = true

      setTimeout(() => {
        bool = false
      }, 3000)

      this.render = () => {
        return {
          nodeName: 'body',
          childNodes: [
            { nodeName: 'script' },
            (() => {
              if (bool) {
                return {
                  nodeName: 'div',
                  childNodes: [
                    { nodeName: '#text', props: { nodeValue: 'if' } },
                  ],
                }
              } else if (bool) {
                return {
                  nodeName: 'div',
                  childNodes: [
                    { nodeName: '#text', props: { nodeValue: 'else if' } },
                  ],
                }
              } else {
                return {
                  nodeName: 'div',
                  childNodes: [
                    { nodeName: '#text', props: { nodeValue: 'else' } },
                  ],
                }
              }
            })(),
            {
              nodeName: 'ul',
              childNodes: [
                ...(function* () {
                  for (const item of list) {
                    yield {
                      nodeName: 'li',
                      props: {},
                      childNodes: [
                        { nodeName: '#text', props: { nodeValue: `${item}` } },
                      ],
                    }
                  }
                })(),
              ],
            },
          ],
        }
      }
    }
  },
}

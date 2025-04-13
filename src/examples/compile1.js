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

    <div if="bool">if23</div>
    <div else if="bool">else if</div>
    <div else>else</div>

    <ul>
      <li for="const item of list">
        <span>${item}</span>
        <ol>
          <li for="const item2 of list">${item2}</li>
        </ol>
      </li>
    </ul>

    <div .title="1 + 1" .onclick="alert">${'string'}</div>
`
with (this.scope) {
  this.scope.propX = this.props.propX
  this.scope.list = [1, 2, 3]
  this.scope.bool = true

  setTimeout(() => {
    bool = false
  }, 3000)

  this.render = () => {
    return [
      N({ n: 'SCRIPT' }),
      N({
        if: 'bool',
        render: () => {
          if (bool) {
            return N({ if: 'bool' })
          } else if (bool) {
            return N({ else: true, if: 'bool' })
          } else {
            return N({ else: true })
          }
        },
      }),
      N({ else: true, if: 'bool' }),
      N({ else: true }),
      N({ n: 'UL' }, [
        N({
          render: function* () {
            for (const item of list) {
              yield N({ n: 'LI', for: 'const item of list' }, [
                N({ n: 'SPAN' }, [N({ nodeValue: `${item}` })]),
                N({ n: 'OL' }, [
                  N({
                    render: function* () {
                      for (const item2 of list) {
                        yield N({ n: 'LI', for: 'const item2 of list' }, [
                          N({ nodeValue: `${item2}` }),
                        ])
                      }
                    },
                  }),
                ]),
              ])
            }
          },
        }),
      ]),
      N({ n: 'DIV', props: { title: 1 + 1, onclick: alert } }, [
        N({ nodeValue: `${'string'}` }),
      ]),
    ]
  }
}

new MutationObserver((mutationsList, observer) => {
  mutationsList
    .filter((m) => m.type === 'childList')
    .map((m) => [...m.addedNodes])
    .flat()
    .forEach((node) => {
      if (!(node instanceof HTMLScriptElement)) return
      console.log('script', node.outerHTML)
      if (node.src) return

      const type = node.type
      node.type = 'text/ezv'
      setTimeout(() => {
        node.type = type
      })
    })
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
})

document.documentElement.hidden = true
import('./View.js').then(({ View }) => {
  const view = new View(document.body)
  // const view = new View(document.querySelector('#ezv'))
  window.view = view
  // view.scope = {
  //   list: [1, 2, 3],
  //   bool: true,
  // }
  view.create()
  view.render()

  document.documentElement.hidden = false
})

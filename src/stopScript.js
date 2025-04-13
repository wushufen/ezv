new MutationObserver((mutationsList, observer) => {
  mutationsList
    .filter((m) => m.type === 'childList')
    .map((m) => [...m.addedNodes])
    .flat()
    .forEach((node) => {
      if (node.tagName === 'SCRIPT') {
        console.log('remove', node.outerHTML)
        // node.remove()
      }
    })
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
})

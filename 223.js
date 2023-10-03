function calculateWidthForText (text) {
    if (spacer === undefined) { // on first call only.
      spacer = document.createElement('span')
      spacer.style.visibility = 'hidden'
      spacer.style.position = 'fixed'
      spacer.style.outline = '0'
      spacer.style.margin = '0'
      spacer.style.padding = '0'
      spacer.style.border = '0'
      spacer.style.left = '0'
      spacer.style.whiteSpace = 'pre'
      spacer.style.fontSize = fontSize
      spacer.style.fontFamily = fontFamily
      spacer.style.fontWeight = 'normal'
      document.body.appendChild(spacer)
    }

    spacer.textContent = text
    return spacer.getBoundingClientRect().right
  }
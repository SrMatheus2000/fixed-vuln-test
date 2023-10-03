function DOMHandling({ i, t, j, ttItems, values, seriesName, shared, pColor }) {
    const w = this.w
    const ttCtx = this.ttCtx

    Object.keys(values).forEach(key => {
      if (typeof values[key] == 'string')
        values[key] = Utilities.sanitizeDom(values[key])
    })

    const { val, xVal, xAxisTTVal, zVal } = values

    let ttItemsChildren = null
    ttItemsChildren = ttItems[t].children

    if (w.config.tooltip.fillSeriesColor) {
      //  elTooltip.style.backgroundColor = pColor
      ttItems[t].style.backgroundColor = pColor
      ttItemsChildren[0].style.display = 'none'
    }

    if (ttCtx.showTooltipTitle) {
      if (ttCtx.tooltipTitle === null) {
        // get it once if null, and store it in class property
        ttCtx.tooltipTitle = w.globals.dom.baseEl.querySelector(
          '.apexcharts-tooltip-title'
        )
      }
      ttCtx.tooltipTitle.innerHTML = xVal
    }

    // if xaxis tooltip is constructed, we need to replace the innerHTML
    if (ttCtx.blxaxisTooltip) {
      ttCtx.xaxisTooltipText.innerHTML = xAxisTTVal !== '' ? xAxisTTVal : xVal
    }

    const ttYLabel = ttItems[t].querySelector('.apexcharts-tooltip-text-label')
    if (ttYLabel) {
      ttYLabel.innerHTML = seriesName ? Utilities.sanitizeDom(seriesName) : ''
    }
    const ttYVal = ttItems[t].querySelector('.apexcharts-tooltip-text-value')
    if (ttYVal) {
      ttYVal.innerHTML = typeof val !== 'undefined' ? val : ''
    }

    if (
      ttItemsChildren[0] &&
      ttItemsChildren[0].classList.contains('apexcharts-tooltip-marker')
    ) {
      if (
        w.config.tooltip.marker.fillColors &&
        Array.isArray(w.config.tooltip.marker.fillColors)
      ) {
        pColor = w.config.tooltip.marker.fillColors[t]
      }

      ttItemsChildren[0].style.backgroundColor = pColor
    }

    if (!w.config.tooltip.marker.show) {
      ttItemsChildren[0].style.display = 'none'
    }

    if (zVal !== null) {
      const ttZLabel = ttItems[t].querySelector(
        '.apexcharts-tooltip-text-z-label'
      )
      ttZLabel.innerHTML = w.config.tooltip.z.title
      const ttZVal = ttItems[t].querySelector(
        '.apexcharts-tooltip-text-z-value'
      )
      ttZVal.innerHTML = typeof zVal !== 'undefined' ? zVal : ''
    }

    if (shared && ttItemsChildren[0]) {
      // hide when no Val or series collapsed
      if (
        typeof val === 'undefined' ||
        val === null ||
        w.globals.collapsedSeriesIndices.indexOf(t) > -1
      ) {
        ttItemsChildren[0].parentNode.style.display = 'none'
      } else {
        ttItemsChildren[0].parentNode.style.display =
          w.config.tooltip.items.display
      }

      // TODO: issue #1240 needs to be looked at again. commenting it because this also hides single series values with 0 in it (shared tooltip)

      // if (w.globals.stackedSeriesTotals[j] === 0) {
      //   // shared tooltip and all values are null, so we need to hide the x value too
      //   let allYZeroForJ = false
      //   for (let si = 1; si < w.globals.seriesYvalues.length; si++) {
      //     if (
      //       w.globals.seriesYvalues[si][j] ===
      //       w.globals.seriesYvalues[si - 1][j]
      //     ) {
      //       allYZeroForJ = true
      //     }
      //   }

      //   if (allYZeroForJ) {
      //     ttCtx.tooltipTitle.style.display = 'none'
      //   } else {
      //     ttCtx.tooltipTitle.style.display = w.config.tooltip.items.display
      //   }
      // } else {
      //   ttCtx.tooltipTitle.style.display = w.config.tooltip.items.display
      // }
    }
  }
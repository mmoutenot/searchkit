import * as React from "react";


import { PureRender } from "../../../"

const block = require('bem-cn')

const moment = require('moment')
const maxBy = require("lodash/maxBy")
const map = require("lodash/map")

function computeMaxValue(items, field) {
  if (!items || items.length == 0) return 0
  return maxBy(items, field)[field]
}

function isKeyStringValidDate(key_as_string) {
  return moment(key_as_string, moment.ISO_8601, true).isValid();
}

@PureRender
export class RangeHistogram extends React.Component<any, {}> {

  static defaultProps = {
    mod: 'sk-range-histogram'
  }

  render() {
    const { mod, className, min, max, minValue, maxValue, items = []} = this.props

    const bemBlocks = {
      container: block(mod)
    }

    const maxCount = computeMaxValue(items, "doc_count")
    if (maxCount == 0) return null

    let bars = map(items, ({key, key_as_string, doc_count}) => {
      const comparisonKey = isKeyStringValidDate(key_as_string) ? key_as_string : key;
      const outOfBounds = (comparisonKey < minValue || comparisonKey > maxValue)
      return (
        <div className={bemBlocks.container('bar').state({'out-of-bounds': outOfBounds})}
          key={key}
          style={{
            height: `${(doc_count / maxCount) * 100}%`
          }}>
          </div>
      )
    })

    return (
      <div className={bemBlocks.container().mix(className)}>
        {bars}
      </div>
    )
  }
}

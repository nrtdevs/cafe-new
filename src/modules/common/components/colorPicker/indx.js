/* eslint-disable no-invalid-this */
'use strict'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'

class ColorPicker {
  state = {
    displayColorPicker: false,
    color: {
      r: '0',
      g: '0',
      b: '0',
      a: '1'
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  }

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props?.onChange(color)
  }

  render() {
    const styles = reactCSS({
      default: {
        color: {
          height: '28px',
          borderRadius: '2px',
          background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'block',
          cursor: 'pointer'
        },
        popover: {
          position: 'absolute',
          zIndex: '20'
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      }
    })

    return (
      <div className={`flex-1 color-picker' + " " + ${this?.props?.className}`}>
        <div style={styles.swatch} onClick={this.handleClick}>
          <div style={styles.color} />
        </div>
        {this.state.displayColorPicker ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.handleClose} />
            <SketchPicker
              disableAlpha
              color={this.state.color}
              presetColors={[]}
              onChange={this.handleChange}
            />
          </div>
        ) : null}
      </div>
    )
  }
}

export default ColorPicker

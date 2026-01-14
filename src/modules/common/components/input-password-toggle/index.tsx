// ** React Imports
import { Fragment, useState, forwardRef } from 'react'

// ** Third Party Components
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Eye, EyeOff } from 'react-feather'

// ** Reactstrap Imports
import { InputGroup, Input, InputGroupText, Label } from 'reactstrap'

const InputPasswordToggle = forwardRef<any, any>((props, ref) => {
  // ** Props
  const {
    label,
    hideIcon,
    showIcon,
    visible,
    className,
    htmlFor,
    placeholder,
    iconSize,
    inputClassName,
    invalid,
    ...rest
  } = props

  // ** State
  const [inputVisibility, setInputVisibility] = useState(visible)

  // ** Renders Icon Based On Visibility
  const renderIcon = () => {
    const size = iconSize ? iconSize : 14

    if (inputVisibility === false) {
      return hideIcon ? hideIcon : <Eye size={size} />
    } else {
      return showIcon ? showIcon : <Eye className='text-primary' size={size} />
    }
  }

  return (
    <Fragment>
      <Input
        ref={ref}
        invalid={invalid}
        type={inputVisibility === false ? 'password' : 'text'}
        placeholder={placeholder ? placeholder : '············'}
        className={classnames({
          [inputClassName]: inputClassName
        })}
        /*eslint-disable */
        {...(label && htmlFor
          ? {
              id: htmlFor
            }
          : {})}
        {...rest}
        /*eslint-enable */
      />
      <InputGroupText
        className='cursor-pointer'
        onClick={() => setInputVisibility(!inputVisibility)}
      >
        {renderIcon()}
      </InputGroupText>
    </Fragment>
  )
})

export default InputPasswordToggle

// ** PropTypes
InputPasswordToggle.propTypes = {
  value: PropTypes.any,
  invalid: PropTypes.bool,
  hideIcon: PropTypes.node,
  showIcon: PropTypes.node,
  visible: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  iconSize: PropTypes.number,
  inputClassName: PropTypes.string
}

// ** Default Props
InputPasswordToggle.defaultProps = {
  visible: false
}

import { AutoPlacement, BasePlacement, VariationPlacement } from '@popperjs/core'
import { useState } from 'react'
import { UncontrolledTooltip } from 'reactstrap'
import { getUniqId, isValid } from '@src/utility/Utils'

interface propsType {
  Tag?: any
  title?: any
  children?: JSX.Element
  placement?: AutoPlacement | BasePlacement | VariationPlacement
}
function BsTooltip<T>({
  Tag = 'span',
  title,
  children,
  placement = 'top',
  ...rest
}: propsType & T) {
  const [id, setId] = useState(getUniqId('tooltip'))

  if (isValid(title)) {
    return (
      <>
        <UncontrolledTooltip placement={placement} target={id}>
          {title}
        </UncontrolledTooltip>
        <Tag id={id} {...rest}>
          {children}
        </Tag>
      </>
    )
  } else {
    return (
      <Tag id={id} {...rest}>
        {children}
      </Tag>
    )
  }
}

export default BsTooltip

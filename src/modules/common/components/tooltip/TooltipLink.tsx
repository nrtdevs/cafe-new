import { AutoPlacement, BasePlacement, VariationPlacement } from '@popperjs/core'
import { useState } from 'react'
import { Link, LinkProps, NavLinkProps } from 'react-router-dom'
import { UncontrolledTooltip } from 'reactstrap'
import { isValid } from '@src/utility/Utils'
import { getUniqId } from '@src/utility/Utils'

interface propsType extends LinkProps {
  Tag?: any
  title?: any
  children?: JSX.Element
  placement?: AutoPlacement | BasePlacement | VariationPlacement
}
function TooltipLink({ Tag = 'span', title, children, placement = 'top', ...rest }: propsType) {
  const [id, setId] = useState(getUniqId('tooltip'))

  if (isValid(title)) {
    return (
      <>
        <UncontrolledTooltip placement={placement} target={id}>
          {title}
        </UncontrolledTooltip>
        <Link id={id} {...rest}>
          {children}
        </Link>
      </>
    )
  } else {
    return (
      <Link id={id} {...rest}>
        {children}
      </Link>
    )
  }
}

export default TooltipLink

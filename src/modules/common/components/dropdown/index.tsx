import classNames from 'classnames'
import { ElementType, useEffect, useRef, useState } from 'react'
import { Check, CheckSquare, MoreVertical } from 'react-feather'
import { Link } from 'react-router-dom'
import {
  DropdownItem,
  DropdownMenu as DM,
  DropdownToggle,
  UncontrolledButtonDropdown,
  UncontrolledTooltip
} from 'reactstrap'
import { Direction } from 'reactstrap/types/lib/Dropdown'
import { IconSizes } from '@src/utility/Const'
import { isValidArray } from '@src/utility/Utils'
import { Can } from '@src/utility/Show'
import { fastLoop, getUniqId } from '@src/utility/Utils'
// import FollowUpModal from '../../masters/followups/fragments/followUpModal'
export interface OptionProps {
  IF?: boolean | any
  to?: string | any
  state?: any
  icon?: any
  name: any
  noWrap?: boolean
  onClick?: any
  active?: boolean
}
interface PropsTypes {
  options: OptionProps[]
  direction?: Direction
  toggle?: boolean
  button?: any
  tag?: ElementType
  component?: any
  tooltip?: string | null
  disabled?: boolean
}

export const DropdownItemWrap = ({ name = null, icon = null }: { name: any; icon: any | null }) => {
  return (
    <DropdownItem tag={'span'} className='dropdown-item d-flex align-items-center'>
      {icon ? (
        <>
          <span className='me-1'>{icon}</span>
          {name}
        </>
      ) : (
        name
      )}
    </DropdownItem>
  )
}
const DropDownMenu = ({
  direction = 'down',
  button = null,
  toggle = true,
  tag = 'span',
  component = null,
  options = [],
  tooltip = null,
  disabled = false
}: PropsTypes) => {
  const [id, setId] = useState(getUniqId('dropdown'))
  const ref = useRef<any>()

  const renderOptions = () => {
    const re: React.ReactElement[] = []
    if (isValidArray(options)) {
      fastLoop<OptionProps>(options, (o: OptionProps, i: number) => {
        const IF = o?.IF === undefined || o?.IF === null ? true : o?.IF
        if (Can(IF)) {
          if (o?.to) {
            re.push(
              <>
                <Link
                  className='dropdown-item d-flex align-items-center'
                  state={o.state}
                  to={o?.to}
                  key={o?.name + i}
                  onClick={o?.onClick}
                >
                  {o?.icon ? (
                    <>
                      <span className='me-1' style={{ marginTop: '-3px' }}>
                        {o?.icon}
                      </span>
                      <span className='align-middle'>{o?.name}</span>
                    </>
                  ) : (
                    o?.name
                  )}
                </Link>
              </>
            )
          } else {
            re.push(
              <>
                {o?.noWrap ? (
                  o?.name
                ) : (
                  <DropdownItem
                    active={o?.active ?? false}
                    role={'button'}
                    toggle={toggle}
                    tag='span'
                    className={`dropdown-item`}
                    key={o?.name + i}

                    onClick={o?.onClick}
                  >
                    {o?.icon ? (
                      <>
                        <span className='me-1'>{o?.icon}</span>
                        <span className='align-middle'>{o?.name}</span>
                      </>
                    ) : (
                      o?.name
                    )}
                  </DropdownItem>
                )}
              </>
            )
          }
        }
      })
    }
    return re
  }

  const ap: React.ReactElement[] = renderOptions()

  useEffect(() => {
    // log(ref.current)
  }, [ref?.current])

  return (
    <>
      {tooltip ? <UncontrolledTooltip target={id}>{tooltip}</UncontrolledTooltip> : null}
      <UncontrolledButtonDropdown
        ref={ref}
        // positionFixed={true}
        className='dropdown'
        disabled={!isValidArray(ap) || disabled}
        direction={direction}
      >
        {button}
        {button ? (
          <DropdownToggle className='dropdown-toggle-split' id={id} outline color='primary' caret />
        ) : (
          <DropdownToggle className={classNames('cursor-pointer')} id={id} tag={tag}>
            {component ?? <MoreVertical size={IconSizes.MenuVertical} />}
          </DropdownToggle>
        )}
        {/* <Show IF={disabled}>
          <> */}
        <DM container={'body'} key={'body'}>
          {ap ?? null}
        </DM>
        {/* </> */}
        {/* </Show> */}
      </UncontrolledButtonDropdown>

      {/* <>
        {tooltip ? <UncontrolledTooltip target={id}>{tooltip}</UncontrolledTooltip> : null}
        <UncontrolledButtonDropdown direction={direction}>
          {button}
          {button ? (
            <DropdownToggle
              className='dropdown-toggle-split'
              id={id}
              outline
              color='primary'
              caret
            />
          ) : (
            <DropdownToggle className={classNames('cursor-pointer')} id={id} tag={tag}>
              {component ?? <MoreVertical size={IconSizes.MenuVertical} />}
            </DropdownToggle>
          )}
          <DM>{ap}</DM>
        </UncontrolledButtonDropdown>
      </> */}
    </>
  )
}

export default DropDownMenu

import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { FM, log } from '@src/utility/Utils'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import React, { useContext, useEffect } from 'react'
import { UserPlus } from 'react-feather'
import { NavItem, NavLink } from 'reactstrap'

const UserList = () => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const [modal, toggleModal] = useModal()

  // create a menu on header
  useEffect(() => {
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title={FM('create-user')}>
            <NavLink
              className=''
              onClick={(e) => {
                log('cliked', new Date())
                toggleModal()
              }}
            >
              <UserPlus className='ficon' />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [])

  return <div>DPr UserList {String(modal)}</div>
}

export default UserList

// ** Third Party Components
import { FM } from '@src/utility/Utils'
import { MoreHorizontal } from 'react-feather'

const VerticalNavMenuSectionHeader = ({ item }) => {
  return (
    <li className='navigation-header'>
      <span>{FM(item.header)}</span>
      <MoreHorizontal className='feather-more-horizontal' />
    </li>
  )
}

export default VerticalNavMenuSectionHeader

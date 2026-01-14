// ** React Imports
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
//import logo copy.png

import logo from '@src/assets/images/logo/logo.png'
// ** Icons Imports
import { Circle, Disc, X } from 'react-feather'

// ** Config

// ** Utils
import { getUserData } from '@utils'

// logo
import { useSkin } from '@hooks/useSkin'
import { getPath } from '@src/router/RouteHelper'

const VerticalMenuHeader = (props) => {
    // ** Props
    const { menuCollapsed, setMenuCollapsed, setMenuVisibility, setGroupOpen, menuHover } = props

    // use skin
    const { skin } = useSkin()

    // ** Vars
    const user = getUserData()

    // ** Reset open group
    useEffect(() => {
        if (!menuHover && menuCollapsed) setGroupOpen([])
    }, [menuHover, menuCollapsed])

    // ** Menu toggler component
    const Toggler = () => {
        if (!menuCollapsed) {
            return (
                <Disc
                    size={20}
                    data-tour='toggle-icon'
                    className={`${skin === 'dark' ? 'text-light' : 'text-brand'
                        } toggle-icon d-none d-xl-block`}
                    onClick={() => setMenuCollapsed(true)}
                />
            )
        } else {
            return (
                <Circle
                    size={20}
                    data-tour='toggle-icon'
                    className={`${skin === 'dark' ? 'text-light' : 'text-brand'
                        }  toggle-icon d-none d-xl-block`}
                    onClick={() => setMenuCollapsed(false)}
                />
            )
        }
    }

    return (
        <div className='navbar-header'>
            <ul className='nav navbar-nav flex-row'>
                <li className='nav-item me-auto'>
                    <NavLink to={getPath('report')} className='navbar-brand'>
                        <span className={`brand-logo ${skin === 'dark' ? 'text-light' : 'text-brand'}`}>
                            {/* <AppLogo /> */}
                            <img src={logo} height={40} width={60} alt="logo" />
                        </span>
                        <h2 className={`brand-text  ${skin === 'dark' ? 'text-light' : 'text-brand'}`}>
                            {/* <AppLogo height={40} width={150} /> */}
                            <img className='me-2' src={logo} height={35} width={40} alt="logo" />
                            <span tag="h1" className='text-primary'>Cafe App</span>
                        </h2>
                    </NavLink>
                </li>
                <li className='nav-item nav-toggle'>
                    <div className='nav-link modern-nav-toggle cursor-pointer'>
                        <Toggler />
                        <X
                            onClick={() => setMenuVisibility(false)}
                            className='toggle-icon icon-x d-block d-xl-none'
                            size={20}
                        />
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default VerticalMenuHeader

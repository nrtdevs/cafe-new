
import {
    useLoadNotificationsMutation,
    useReadAllNotificationsMutation,
    useReadNotificationsMutation
} from '@src/modules/meeting/redux/RTKQuery/AppSettingRTK'
import { handleNotifications } from '@src/redux/navbar'
import { useAppDispatch } from '@src/redux/store'
import Emitter from '@src/utility/Emitter'
import Hide from '@src/utility/Hide'
import { FM } from '@src/utility/Utils'
import classNames from 'classnames'
import { useEffect } from 'react'
import { ArrowLeft } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { Col, Row } from 'reactstrap'

interface HeaderProps {
    title: string | any
    children?: JSX.Element | JSX.Element[] | null
    titleCol?: string
    childCol?: string
    subHeading?: string | null | JSX.Element
    icon?: any
    loading?: boolean
    description?: string | null | JSX.Element
    noHeader?: boolean
    goBack?: boolean
    onClickBack?: () => void
    rowClass?: string
    route?: any
}

const Header = ({
    title,
    goBack = false,
    loading = false,
    onClickBack = () => { },
    children = null,
    titleCol = '7',
    childCol = '5',
    subHeading = null,
    icon = null,
    rowClass = 'mb-2',
    description = null,
    noHeader = false,
    route = null
}: HeaderProps) => {
    const location = useLocation()
    const navigation = useNavigate()
    const dispatch = useAppDispatch()
    const [loadNotification, loadNotificationResponse] = useLoadNotificationsMutation()
    const [readAll, readAllResponse] = useReadAllNotificationsMutation()
    const [read, readResponse] = useReadNotificationsMutation()

    // send loading event
    useEffect(() => {
        Emitter.emit('loadNotificationResponseLoading', loadNotificationResponse.isLoading)
    }, [loadNotificationResponse.isLoading])

    // send loading event
    useEffect(() => {
        Emitter.emit('loadNotificationResponseLoadingR', readAllResponse.isLoading)
    }, [readAllResponse.isLoading])

    // handle load notification response
    useEffect(() => {
        if (loadNotificationResponse.data) {
            //   log('loadNotificationResponse', loadNotificationResponse.data)
            dispatch(handleNotifications(loadNotificationResponse.data?.data))
        }
    }, [loadNotificationResponse.data])

    // handle readAllNotifications event
    useEffect(() => {
        Emitter.on('readAllNotifications', (data: boolean) => {
            readAll({})
        })
        return () => {
            Emitter.off('readAllNotifications', (data: boolean) => { })
        }
    }, [])

    // handle read notification event
    useEffect(() => {
        setTimeout(() => {
            Emitter.on('readNotification', (data: number) => {
                read({ jsonData: { id: data } })
            })
        }, 2000)

        return () => {
            Emitter.off('readNotification', (data: number) => { })
        }
    }, [])

    // read all response
    useEffect(() => {
        if (readAllResponse.data) {
            loadNotification({
                page: 1,
                per_page_record: 5
            })
        }
    }, [readAllResponse.data])

    // read response
    useEffect(() => {
        if (readResponse.data) {
            loadNotification({
                page: 1,
                per_page_record: 5
            })
        }
    }, [readResponse.data])

    // handle route
    useEffect(() => {
        if (route) {
            document.title = FM(route?.name, { name: title }) + ' |' + ' Cafe App'
        }
    }, [route, title])

    return (
        <>
            <Row className={`align-items-center ${rowClass}`}>
                <Hide IF={noHeader}>
                    <Col md={titleCol} className='d-flex align-items-center'>
                        <h2
                            role={'button'}
                            onClick={() => {
                                goBack ? navigation(-1) : null
                            }}
                            className={classNames('content-header-title float-left mb-0 text-primary', {
                                'border-end pe-1': !subHeading
                            })}
                        >
                            {goBack ? <ArrowLeft size='25' /> : icon ? icon : null}{' '}
                            <span className='align-middle text-capitalize'>{title}</span>
                        </h2>
                        <div className='text-dark ms-1 p-0 mb-0'>{subHeading}</div>
                    </Col>
                </Hide>
                <Col
                    md={noHeader ? '12' : childCol}
                    className={`py-1 py-md-0 d-flex ${noHeader ? '' : 'justify-content-md-end'
                        } justify-content-start`}
                >
                    {children}
                </Col>
                {description ? (
                    <Col md='12' className='mt-1'>
                        {description}
                    </Col>
                ) : null}
            </Row>
        </>
    )
}

export default Header

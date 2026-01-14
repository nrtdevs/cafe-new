import { CurrencyRupee, HMobiledata, LocalParking, Spellcheck } from '@mui/icons-material'
import StatsHorizontal from '@src/@core/components/widgets/stats/StatsHorizontal'
import { getUserData } from '@src/auth/utils'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { stateReducer } from '@src/utility/stateReducer'
import { useContext, useEffect, useReducer } from 'react'
import { AlignJustify, Check, CheckCircle, Clock, Menu, User, XCircle } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Col, Row } from 'reactstrap'
import { todayReportListResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import { useLoadDashboardTodayMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: todayReportListResponseTypes
    enableEdit?: boolean
    editData?: any
}
const TodayReport = () => {
    const form = useForm<todayReportListResponseTypes>({
        // resolver: yupResolver(schema),
        // defaultValues
    })
    const user1 = getUserData()

    const [loadDashboardToday, dashboardTodayRes] = useLoadDashboardTodayMutation()
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        search: '',
        enableEdit: false,
        editData: '',
        lastRefresh: new Date().getTime()
    }
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)
    const { colors } = useContext(ThemeColors)
    const loadTodayList = () => {
        loadDashboardToday({
            page: state.page,
            per_page_record: state.per_page_record
            //   jsonData: {
            //     name: !isValid(state.filterData) ? state.search : undefined,
            //     ...state.filterData,

            //   }
        })
    }

    // log(dashboardTodayRes, 'dsdsd')

    useEffect(() => {
        loadTodayList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])
    return (
        <>
            <Row>
                <div>
                    <h3>Today Order Report </h3>
                </div>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle=' Order Completed'
                        icon={<Check size={26} />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_order_completed}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='secondary'
                        statTitle='Order Pending'
                        icon={<Clock size={26} />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_order_pending}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='primary'
                        statTitle=' Order Confirmed'
                        icon={<CheckCircle size={26} />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_order_confirmed}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='danger'
                        statTitle='Order Cancelled'
                        icon={<XCircle size={26} />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_order_canceled}
                            </h3>
                        }
                    />
                </Col>
            </Row>
            <Row>
                <div>
                    <h3>Today Sale Report </h3>
                </div>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle='Sale Amount'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_sale_amount?.toFixed(2)}{<CurrencyRupee sx={{
                                    maxHeight: '18px'
                                }} />}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='primary'
                        statTitle='Sale Online'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_sale_online?.toFixed(2)}{<CurrencyRupee sx={{
                                    maxHeight: '18px'
                                }} />}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='secondary'
                        statTitle=' Sale Offline'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_sale_offline?.toFixed(2)}{<CurrencyRupee sx={{
                                    maxHeight: '18px'
                                }} />}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle=' Sale Udhari'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_sale_udhari?.toFixed(2)}{<CurrencyRupee sx={{
                                    maxHeight: '18px'
                                }} />}
                            </h3>
                        }
                    />
                </Col>
            </Row>
            <Row>
                <div>
                    <h3>Today Attendance </h3>
                </div>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle='Present'
                        icon={<LocalParking />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_present_employees_count}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='primary'
                        statTitle='Half Day'
                        icon={<HMobiledata />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_half_day_employees_count}
                            </h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='danger'
                        statTitle='Absent'
                        icon={<Spellcheck />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>
                                {dashboardTodayRes?.data?.payload?.todays_absent_employees_count}
                            </h3>
                        }
                    />
                </Col>
                {user1?.role_id === 1 ? (
                    <Col md='3' xs='6'>
                        <StatsHorizontal
                            color='success'
                            statTitle='Employee'
                            icon={<User />}
                            renderStats={
                                <h3 className='fw-bolder mb-75'>
                                    {dashboardTodayRes?.data?.payload?.todays_present_employees_count +
                                        dashboardTodayRes?.data?.payload?.todays_half_day_employees_count +
                                        dashboardTodayRes?.data?.payload?.todays_absent_employees_count}
                                </h3>
                            }
                        />
                    </Col>
                ) : (
                    <Col md='3' xs='6'>
                        <StatsHorizontal
                            color='success'
                            statTitle='Employee'
                            icon={<User />}
                            renderStats={
                                <h3 className='fw-bolder mb-75'>
                                    {dashboardTodayRes?.data?.payload?.totalEmployee}
                                </h3>
                            }
                        />
                    </Col>
                )}
                {/* <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle='Employee'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>{dashboardTodayRes?.data?.payload?.totalEmployee}</h3>
                        }
                    />
                </Col> */}
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle=' Expense'
                        icon={<CurrencyRupee />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>{dashboardTodayRes?.data?.payload?.total_expense}</h3>
                        }
                    />
                </Col>
            </Row>
            <Row>
                <div>
                    <h3>Today Wastage </h3>
                </div>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle='Total Wastage Menu'
                        icon={<Menu />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>{dashboardTodayRes?.data?.payload?.total_wastage_menu}</h3>
                        }
                    />
                </Col>
                <Col md='3' xs='6'>
                    <StatsHorizontal
                        color='success'
                        statTitle='Total Wastage Product'
                        icon={<AlignJustify />}
                        renderStats={
                            <h3 className='fw-bolder mb-75'>{dashboardTodayRes?.data?.payload?.total_wastage_product}</h3>
                        }
                    />
                </Col>
            </Row>

        </>
    )
}

export default TodayReport

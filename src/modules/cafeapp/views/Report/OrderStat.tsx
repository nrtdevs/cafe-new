import { getUserData } from '@src/auth/utils'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { DatedayweakStatus } from '@src/utility/Const'
import Show from '@src/utility/Show'
import { FM, createConstSelectOptions, isValid } from '@src/utility/Utils'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Chart as ChartJS, registerables } from 'chart.js'
import { useContext, useEffect, useReducer } from 'react'
import { Bar } from 'react-chartjs-2'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Row } from 'reactstrap'
import { GraphReportListResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import { useLoadDashboardgraphMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
ChartJS.register(...registerables)
type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: GraphReportListResponseTypes
    enableEdit?: boolean
    editData?: any
}

const OrderStat = () => {
    const form = useForm<GraphReportListResponseTypes>({
        // resolver: yupResolver(schema),
        // defaultValues
    })
    const [loadDashboardOrderGraph, dashboardOrderGraphRes] = useLoadDashboardgraphMutation()
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
    const user = getUserData()
    const [state, setState] = useReducer(reducers, initState)
    const { colors } = useContext(ThemeColors)
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const currentDate = `${year}-${month}-${day}`
    const loadOrderList = () => {
        loadDashboardOrderGraph({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData,
                day: form.watch('request_for')?.value,
                start_date: form.watch('start_date') ? form.watch('start_date') : currentDate,
                end_date: form.watch('end_date') ? form.watch('end_date') : currentDate,
                menu_id: form.watch('menu_id')?.value,
                cafe_id: form.watch('cafe_id')?.value
            }
        })
    }
    useEffect(() => {
        loadOrderList()
    }, [
        state.page,
        state.search,
        state.per_page_record,
        state.filterData,
        state.lastRefresh,
        form.watch('request_for'),
        form.watch('start_date'),
        form.watch('end_date'),
        form.watch('menu_id'),
        form.watch('cafe_id'),
        form.watch('category_id')
    ])
    const options: any = {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 100 },
        elements: {
            bar: {
                borderRadius: {
                    topRight: 0,
                    topLeft: 0
                },
                endingShape: 'rounded'
            }
        },

        layout: {
            padding: { top: -2 }
        },
        scales: {
            y: {
                min: 0,
                grid: {
                    drawTicks: false,
                    color: 'rgba(200, 200, 200, 0.2)',
                    borderColor: 'transparent'
                },
                ticks: { color: '#6e6b7b' }
            },
            x: {
                grid: {
                    display: false,
                    borderColor: 'rgba(200, 200, 200, 0.2)'
                },
                ticks: { color: '#6e6b7b' }
            }
        },
        plugins: {
            legend: {
                align: 'end',
                position: 'top',
                labels: { color: '#6e6b7b' }
            }
        }
    }
    // ** Chart data

    const data: any = {
        labels: dashboardOrderGraphRes?.data?.payload?.labels,
        datasets: [
            {
                maxBarThickness: 40,
                label: 'Order Completed',
                borderColor: 'transparent',
                //   borderRadius: { topRight: 15, topLeft: 15 },
                backgroundColor: colors.success.main,
                data: dashboardOrderGraphRes?.data?.payload?.order_completed
            },

            {
                maxBarThickness: 40,
                label: 'Order Pending',
                borderColor: 'transparent',
                borderWidth: 0.5,
                backgroundColor: colors.secondary.main,
                //   borderRadius: { topRight: 15, topLeft: 15 },
                data: dashboardOrderGraphRes?.data?.payload?.order_pending
            },
            {
                maxBarThickness: 40,
                label: 'Order Confirmed',
                borderColor: 'transparent',
                borderWidth: 0.5,
                backgroundColor: colors.info.main,
                //   borderRadius: { topRight: 15, topLeft: 15 },
                data: dashboardOrderGraphRes?.data?.payload?.order_confirmed
            },

            {
                maxBarThickness: 40,
                label: 'Order Cancelled',
                borderColor: 'transparent',
                borderWidth: 0.5,

                backgroundColor: colors.danger.main,
                data: dashboardOrderGraphRes?.data?.payload?.order_canceled
            }
        ]
    }
    return (
        <>
            <div>
                <h3>Order Stats</h3>
            </div>
            <Card>
                <div className='border-bottom p-1'>
                    <Row>
                        <Col md='2' className='d-flex align-items-center'>
                            <div className='h4 fw-bolder mb-0 text-primary'>Order Stats</div>
                        </Col>

                        <Col md='10'>
                            <Row className='justify-content-end'>
                                <Show IF={user?.role_id === 1}>
                                    <Col md='4'>
                                        <Show IF={user?.role_id === 1}>
                                            <FormGroupCustom
                                                control={form.control}
                                                async
                                                noGroup
                                                isClearable
                                                noLabel
                                                label={'cafe'}
                                                name='cafe_id'
                                                loadOptions={loadDropdown}
                                                path={ApiEndpoints.cafeList}
                                                selectLabel={(e) => ` ${e.name} `}
                                                selectValue={(e) => e.id}
                                                defaultOptions
                                                type='select'
                                                className='mb-1'
                                                rules={{ required: false }}
                                            />
                                        </Show>
                                    </Col>
                                </Show>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${form.watch('cafe_id')?.value}`}
                                        control={form.control}
                                        noGroup
                                        noLabel
                                        isClearable
                                        async
                                        label='Category'
                                        name='category_id'
                                        loadOptions={loadDropdown}
                                        jsonData={{
                                            cafe_id: form.watch('cafe_id')?.value
                                        }}
                                        path={ApiEndpoints.categories}
                                        selectLabel={(e) => `${e.name}  `}
                                        selectValue={(e) => e.id}
                                        defaultOptions
                                        type='select'
                                        className='mb-1 me-1'
                                        rules={{ required: false }}
                                    />
                                </Col>
                                <Col md='4'>
                                    <FormGroupCustom
                                        key={`${form.watch('cafe_id')?.value},${form.watch('category_id')?.value}`}
                                        control={form.control}
                                        noGroup
                                        noLabel
                                        isClearable
                                        async
                                        label='Menu'
                                        name='menu_id'
                                        loadOptions={loadDropdown}
                                        jsonData={{
                                            cafe_id: form.watch('cafe_id')?.value,
                                            category_id: form.watch('category_id')?.value
                                        }}
                                        path={ApiEndpoints.menus}
                                        selectLabel={(e) => `${e.name}  `}
                                        selectValue={(e) => e.id}
                                        defaultOptions
                                        type='select'
                                        className='mb-1 me-1'
                                        rules={{ required: false }}
                                    />
                                </Col>

                                {
                                    <Col md='4'>
                                        <FormGroupCustom
                                            control={form.control}
                                            noGroup
                                            isClearable
                                            noLabel
                                            isDisabled={!!form.watch('start_date') || form.watch('end_date')}
                                            placeholder='Today|Week|Month'
                                            name='request_for'
                                            selectOptions={createConstSelectOptions(DatedayweakStatus, FM)}
                                            type='select'
                                            className='mb-1 me-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                }

                                <>
                                    <Col md='4'>
                                        <FormGroupCustom
                                            noLabel
                                            name={'start_date'}
                                            isDisabled={!!form.watch('request_for')}
                                            type={'date'}
                                            isClearable
                                            label={FM('start-date')}
                                            dateFormat={'YYYY-MM-DD'}
                                            className='mb-0 ms-1'
                                            control={form.control}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md='4'>
                                        <FormGroupCustom
                                            noLabel
                                            isClearable
                                            isDisabled={!!form.watch('request_for')}
                                            name={'end_date'}
                                            type={'date'}
                                            label={FM('end-date')}
                                            dateFormat={'YYYY-MM-DD'}
                                            className='mb-0'
                                            control={form.control}
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                </>
                            </Row>
                        </Col>
                    </Row>

                    {/* <Show IF={cafe_id1 === '1' || cafe_id1 === '5'}>
                    <Row className='d-flex justify-content-end mt-1'>
                        <Col md="3">
                            <FormGroupCustom
                                noLabel

                                type={"select"}
                                isClearable
                                // defaultOptions
                                control={control}
                                options={cafe}
                                name={"cafe_id"}

                                placeholder="cafe"
                                className="mb-0 "
                                rules={{ required: false }}
                            />
                        </Col>
                    </Row>
                </Show> */}
                </div>
                <CardBody>
                    <div style={{ height: '400px' }}>
                        <Bar data={data} options={options} height={400} />
                    </div>
                </CardBody>
            </Card>
        </>
    )
}

export default OrderStat

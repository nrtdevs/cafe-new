import DropDownMenu, { OptionProps } from '@modules/common/components/dropdown'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import Shimmer from '@modules/common/components/shimmers/Shimmer'
import Hide from '@src/utility/Hide'
import Show from '@src/utility/Show'
import { FM, fastLoop, getUserData, isValid } from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { HttpListResponse } from '@src/utility/types/typeResponse'
import { forwardRef, useEffect, useReducer } from 'react'
import DataTable, { TableColumn } from 'react-data-table-component'
import { ChevronsDown, ChevronsUp } from 'react-feather'
import { useForm } from 'react-hook-form'
import ReactPaginate from 'react-paginate'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  UncontrolledButtonDropdown
} from 'reactstrap'
// ** Styles
import { FMKeys } from '@src/configs/i18n/FMTypes'
import '@styles/react/libs/tables/react-dataTable-component.scss'

interface StateProps {
  selectedRowsChange?: any
}
export type TableDropDownOptions = (selected: {
  ids: Array<any>
  allSelected: boolean
  selectedCount: number
  selectedRows: Array<any>
}) => OptionProps[]

export type TableFormData = {
  page: string | number
  per_page_record: any
  search: any
}
interface dataTypes<T> {
  columns?: TableColumn<T>[]
  tableData?: any
  HidePerPage?: boolean
  paginatedData?: HttpListResponse<T>
  selectableRows?: boolean
  checkboxKey?: string
  extraButtons?: any
  isLoading?: boolean
  isFetching?: boolean
  onSearch?: (e: string) => void
  isDisabledRow?: boolean
  onSelectedRowsChange?: (selected: {
    allSelected: boolean
    selectedCount: number
    selectedRows: Array<any>
  }) => void
  handlePaginationAndSearch?: (e: TableFormData) => void
  options?: TableDropDownOptions
  initialPerPage?: any
  hideHeader?: boolean
  hideFooter?: boolean
  hideSearch?: boolean
  cardClass?: string
  selectableRowDisabled?: (row: T) => boolean
  searchPlaceholder?: FMKeys
  onSort?: (column: TableColumn<T>, sortDirection: 'asc' | 'desc') => void
  defaultSortField?: any
  fixedHeaderScrollHeight?: any
  fixedHeader?: any
  highlightOnHover?: any
}

function CustomDataTable<T>({
  columns = [],
  tableData = [],
  paginatedData,
  HidePerPage = false,
  selectableRows = false,
  isDisabledRow = false,
  onSelectedRowsChange = (e) => {},
  handlePaginationAndSearch = () => {},
  checkboxKey = 'id',
  extraButtons,
  options = (e) => [],
  onSearch = (e) => {},
  isLoading = false,
  isFetching = false,
  initialPerPage = 15,
  hideHeader = false,
  fixedHeader = null,
  selectableRowDisabled,
  hideFooter = false,
  hideSearch = false,
  fixedHeaderScrollHeight,
  highlightOnHover,
  cardClass = '',
  onSort,
  defaultSortField,
  searchPlaceholder = 'search'
}: dataTypes<T>): JSX.Element {
  const initState: StateProps = {
    selectedRowsChange: {
      ids: [],
      allSelected: false,
      selectedCount: 0,
      selectedRows: []
    }
  }

  const user = getUserData()
  const stateR = stateReducer<StateProps>
  const [state, setState] = useReducer(stateR, initState)
  const form = useForm<TableFormData>({
    defaultValues: {
      per_page_record: initialPerPage,
      page: 1
    }
  })
  const { control, watch, setValue } = form

  const BootstrapCheckbox: any = forwardRef((props, ref: any) => (
    <div className='form-check'>
      <Input type='checkbox' innerRef={ref} {...props} />
    </div>
  ))

  const getCounts = () => {
    let re: any = 1
    if (isValid(paginatedData)) {
      const data = paginatedData

      if (data?.data) {
        re = Math.ceil(data?.total / parseInt(data?.per_page))
      }
    }

    return re
  }

  // handle page and per page and search
  useEffect(() => {
    handlePaginationAndSearch({
      page: watch('page') !== paginatedData?.current_page ? watch('page') : 1,
      per_page_record: watch('per_page_record'),
      search: watch('search') ?? ''
    })
  }, [watch('per_page_record'), watch('page'), watch('search')])
  function handlePageClick({ selected: selectedPage }) {
    setValue('page', selectedPage + 1)
  }

  // ** Custom Pagination
  const CustomPagination: any = () => {
    if (paginatedData?.data) {
      return (
        <div className=''>
          <ReactPaginate
            initialPage={paginatedData?.current_page - 1}
            disableInitialCallback
            // onPageChange={(page: any) => {
            //     setValue('page', page?.selected + 1)
            // }}
            onPageChange={handlePageClick}
            pageCount={getCounts()}
            key={paginatedData?.current_page}
            nextLabel={''}
            breakLabel={'...'}
            breakClassName='page-item'
            breakLinkClassName='page-link'
            activeClassName={'active'}
            pageClassName={'page-item'}
            previousLabel={''}
            nextLinkClassName={'page-link'}
            nextClassName={'page-item next'}
            previousClassName={'page-item prev'}
            previousLinkClassName={'page-link'}
            pageLinkClassName={'page-link'}
            containerClassName={'pagination mb-0 react-paginate justify-content-center'}
          />
        </div>
      )
    }
  }

  const getIds = (e: any) => {
    const re: any = []
    if (isValid(checkboxKey)) {
      fastLoop(e?.selectedRows, (d: any, i: number) => {
        re.push(d[checkboxKey])
      })
    }
    return re
  }

  const handleRowSelection = (e: any) => {
    setState({ selectedRowsChange: { ...e, ids: getIds(e) } })
    onSelectedRowsChange({ ...e, ids: getIds(e) })
  }
  const rows = paginatedData?.data ?? tableData
  const finalRows = [...rows]
  //   if (isAddingNewData) {
  //     finalRows.unshift({ id: 'shimmer' })
  //     finalRows.pop()
  //   }
  const conditionalRowStyles = [
    {
      when: (row: any) => row.id === 'shimmer',
      classNames: ['animated-background', 'animated-table-row']
    }
  ]

  useEffect(() => {
    setState({
      selectedRowsChange: {
        ids: [],
        allSelected: false,
        selectedCount: 0,
        selectedRows: []
      }
    })
  }, [paginatedData])

  return (
    <>
      <Card className={`${cardClass ? cardClass : 'p-0 mb-4'}`}>
        <Hide IF={hideHeader}>
          <CardHeader className='p-1'>
            <div className='flex-1'>
              <Row className='align-items-center'>
                <Col md='9'>
                  <Hide IF={!selectableRows}>
                    <DropDownMenu
                      disabled={state?.selectedRowsChange?.selectedCount === 0}
                      options={[...options(state.selectedRowsChange)]}
                      component={
                        <Button
                          disabled={state?.selectedRowsChange?.selectedCount === 0}
                          color='secondary'
                          className='btn-icon'
                          outline
                          block={false}
                        >
                          <span className='d-flex align-items-center text-uppercase'>
                            <>
                              {FM('action')} <ChevronsDown size={16} />
                            </>
                          </span>
                        </Button>
                      }
                    />
                  </Hide>
                  {extraButtons ?? null}
                </Col>
                <Hide IF={hideSearch}>
                  <Col md='3' className='d-flex align-items-center justify-content-end'>
                    <FormGroupCustom
                      name='search'
                      placeholder={FM(searchPlaceholder)}
                      noLabel
                      type={'text'}
                      control={control}
                    />
                  </Col>
                </Hide>
              </Row>
            </div>
          </CardHeader>
        </Hide>
        <CardBody className='p-0'>
          <Show IF={isLoading && !isFetching}>
            <>
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
              <Shimmer style={{ height: 53, borderBottom: '2px solid #e9e9e9' }} />
            </>
          </Show>
          <Show IF={isFetching}>
            <>
              <Shimmer style={{ height: 36, borderBottom: '1px solid #e9e9e9' }} />
              <Shimmer style={{ height: 54, borderBottom: '1px solid #e9e9e9' }} />
              <Shimmer style={{ height: 54, borderBottom: '1px solid #e9e9e9' }} />
              <Shimmer style={{ height: 54, borderBottom: '1px solid #e9e9e9' }} />
              <Shimmer style={{ height: 54, borderBottom: '1px solid #e9e9e9' }} />
              <Shimmer style={{ height: 54, borderBottom: '0px solid #e9e9e9' }} />
            </>
          </Show>

          <Hide IF={isLoading || isFetching}>
            <div
              className={`react-dataTable ${
                selectableRows ? 'react-dataTable-selectable-rows' : ''
              }`}
            >
              <DataTable<T>
                selectableRowDisabled={selectableRowDisabled}
                conditionalRowStyles={conditionalRowStyles}
                onSelectedRowsChange={handleRowSelection}
                selectableRows={selectableRows}
                columns={columns}
                onSort={onSort}
                highlightOnHover={highlightOnHover}
                fixedHeaderScrollHeight={fixedHeaderScrollHeight}
                sortServer
                persistTableHead
                defaultSortFieldId={defaultSortField?.column}
                // className='react-dataTable'
                sortIcon={
                  defaultSortField?.dir === 'desc' ? (
                    <ChevronsDown size={10} />
                  ) : (
                    <ChevronsUp size={10} />
                  )
                }
                selectableRowsComponent={BootstrapCheckbox}
                data={finalRows}
              />
            </div>
          </Hide>
          {/* <Show IF={isRemovingRow}>
            <>
              <Shimmer style={{ height: 54, borderBottom: '1px solid #e9e9e9' }} />
            </>
          </Show> */}
        </CardBody>
        <Hide IF={hideFooter}>
          <Show IF={isValid(paginatedData)}>
            <CardFooter className='p-1'>
              <Row className='g-1'>
                <Hide IF={HidePerPage}>
                  <Col md='2' className='d-flex align-items-center'>
                    <UncontrolledButtonDropdown>
                      <DropdownToggle color='primary' outline size='sm' caret>
                        {FM('per_page')}
                        {watch('per_page_record')}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          href='/'
                          tag='a'
                          onClick={(e) => {
                            e.preventDefault()
                            setValue('per_page_record', initialPerPage)
                          }}
                        >
                          {initialPerPage}
                        </DropdownItem>
                        <DropdownItem
                          href='/'
                          tag='a'
                          onClick={(e) => {
                            e.preventDefault()
                            setValue('per_page_record', 50)
                          }}
                        >
                          50
                        </DropdownItem>
                        <DropdownItem
                          href='/'
                          tag='a'
                          onClick={(e) => {
                            e.preventDefault()
                            setValue('per_page_record', 100)
                          }}
                        >
                          100
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  </Col>
                </Hide>
                <Col md={HidePerPage ? '5' : '3'} className='d-flex align-items-center'>
                  <Show
                    IF={
                      paginatedData?.total > 0 &&
                      paginatedData?.per_page !== null &&
                      paginatedData?.current_page !== null &&
                      paginatedData?.data?.last_page !== null
                    }
                  >
                    <>
                      {FM('showing-of-available-records', {
                        total: paginatedData?.total ?? 0,
                        showing: paginatedData?.per_page * paginatedData?.current_page!
                      })}
                    </>
                  </Show>
                </Col>
                <Col md='7' className='d-flex align-items-center justify-content-end'>
                  {CustomPagination()}
                </Col>
              </Row>
            </CardFooter>
          </Show>
        </Hide>
      </Card>
    </>
  )
}

export default CustomDataTable

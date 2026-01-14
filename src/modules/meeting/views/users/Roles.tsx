import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { FM, formatDate, isValid } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Role } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Lock, Plus, RefreshCcw } from 'react-feather'
import { Badge, ButtonGroup, NavItem, NavLink } from 'reactstrap'
import { useLoadRolesMutation } from '../../redux/RTKQuery/RoleManagement'
import CreateEditRole from './CreateEditRole'

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedItem?: Role
  enableEdit?: boolean
}

const Roles = (props: any) => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // load roles mutation
  const [loadRoles, loadRolesResponse] = useLoadRolesMutation()
  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)
  // toggle add modal
  const [modalEdit, toggleModalEdit] = useModal()
  // can add role
  const canAddRole = Can(Permissions.dashboardBrowse)
  // can edit role
  const canEditRole = Can(Permissions.dashboardBrowse)

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({ filterData: e, page: 1, search: '', per_page_record: 20 })
  }
  // create a menu on header
  useEffect(() => {
    if (!modalEdit) {
      setState({
        selectedItem: undefined,
        enableEdit: false
      })
    }

    if (!canAddRole) return
    setHeaderMenu(
      <>
        <NavItem className='' onClick={toggleModalEdit}>
          <BsTooltip title={FM('add-role')}>
            <NavLink className=''>
              <Plus className={modalEdit ? 'text-primary' : ''} />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalEdit, setHeaderMenu, canAddRole])

  // reload Data
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  // load role list
  const loadRoleList = () => {
    loadRoles({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadRoleList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // table columns
  const columns: TableColumn<Role>[] = [
    {
      name: FM('name'),
      sortable: true,
      id: 'se_name',
      cell: (row) => {
        return (
          <Fragment>
            <span
              role={'button'}
              onClick={() => {
                setState({
                  selectedItem: row
                })
                toggleModalEdit()
              }}
              className='text-primary'
            >
              {row?.se_name}
            </span>
          </Fragment>
        )
      }
    },
    {
      name: FM('assigned-permissions'),
      sortable: true,
      id: 'permissions',
      cell: (row) => {
        return (
          <Badge color='light-primary'>
            {row.permissions?.length ?? 0} {FM('permissions')}
          </Badge>
        )
      }
    },
    {
      name: FM('created-at'),
      sortable: true,
      id: 'created_at',
      cell: (row) => {
        return <Fragment>{formatDate(row.created_at)}</Fragment>
      }
    },
    {
      name: FM('updated-at'),
      sortable: true,
      id: 'updated_at',
      cell: (row) => {
        return <Fragment>{formatDate(row.updated_at)}</Fragment>
      }
    }
  ]

  // option
  const options: TableDropDownOptions = (selectedRows) => []
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadRolesResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadRolesResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  return (
    <Fragment>
      <CreateEditRole
        reloadCallback={reloadData}
        data={state.selectedItem}
        modal={modalEdit}
        toggleModal={toggleModalEdit}
      />
      <Header route={props?.route} icon={<Lock size='25' />} title={FM('roles')}>
        <ButtonGroup color='dark'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadRolesResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>
      <CustomDataTable<Role>
        initialPerPage={20}
        isLoading={loadRolesResponse.isLoading}
        columns={columns}
        options={options}
        onSort={handleSort}
        defaultSortField={loadRolesResponse?.originalArgs?.jsonData?.sort}
        searchPlaceholder='search-name'
        paginatedData={loadRolesResponse?.data}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Roles

import { RoleResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import { useDeleteRoleByIdMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/RoleRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { useLoadRolesMutation } from '@src/modules/meeting/redux/RTKQuery/RoleManagement'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { FM, emitAlertStatus, formatDate, isValid, isValidArray } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Role } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, Lock, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { Badge, Button, ButtonGroup, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap'
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
  selectedItem?: RoleResponseTypes
  enableEdit?: boolean
}

const Roles = (props: any) => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // load roles mutation
  const [loadRoles, loadRolesResponse] = useLoadRolesMutation()
  //delete
  const [roleDelete, deleteRolesResponse] = useDeleteRoleByIdMutation()
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
  const canAddRole = Can(Permissions.roleCreate)
  // can edit role
  const canEditRole = Can(Permissions.roleEdit)

  //can delete role
  const canDeleteRole = Can(Permissions.roleDelete)

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
              <PlusCircle className={modalEdit ? 'text-primary' : ''} />
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

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      roleDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (deleteRolesResponse?.isLoading === false) {
      if (deleteRolesResponse?.isSuccess) {
        emitAlertStatus('success', null, deleteRolesResponse?.originalArgs?.eventId)
      } else if (deleteRolesResponse?.error) {
        emitAlertStatus('failed', null, deleteRolesResponse?.originalArgs?.eventId)
      }
    }
  }, [deleteRolesResponse])

  const onSuccessEvent = () => {
    reloadData()
  }

  const options: TableDropDownOptions = (selectedRows) => [
    {
      IF: canDeleteRole,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<Trash2 size={14} />}
          onDropdown
          eventId={`item-delete`}
          text={FM('are-you-sure')}
          title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'delete', 'item-delete')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('delete')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditRole,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserCheck size={14} />}
          onDropdown
          eventId={`item-active`}
          text={FM('are-you-sure')}
          title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'active', 'item-active')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('activate')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditRole,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserX size={14} />}
          onDropdown
          eventId={`item-inactive`}
          text={FM('are-you-sure')}
          title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('inactivate')}
        </ConfirmAlert>
      )
    }
  ]

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
      sortable: false,
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
      sortable: false,
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
      sortable: false,
      id: 'created_at',
      cell: (row) => {
        return <Fragment>{formatDate(row.created_at)}</Fragment>
      }
    },
    {
      name: FM('updated-at'),
      sortable: false,
      id: 'updated_at',
      cell: (row) => {
        return <Fragment>{formatDate(row.updated_at)}</Fragment>
      }
    },
    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          {/* <DropDownMenu
                        options={[
                            {
                                icon: <Eye size={'14'} />,
                                name: 'View',
                                onClick: () => {
                                    setState({
                                        selectedUser: row
                                    })
                                }
                            },
                            {
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                onClick: () => {
                                    toggleModalAdd()
                                    setState({ editData: row, enableEdit: !state.enableEdit })
                                }
                            },
                            {
                                IF: canDeleteUser,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.name })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
                                    </ConfirmAlert>
                                )
                            }

                        ]}
                    /> */}
          <ButtonGroup role='group' className='my-2'>
            {canEditRole ? (
              <>
                <UncontrolledTooltip placement='top' id='edit' target='edit'>
                  {'edit'}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-dark btn-sm'
                  id='edit'
                  color=''
                  onClick={() => {
                    setState({
                      selectedItem: row
                    })
                    toggleModalEdit()
                  }}
                >
                  <Edit size={14} />
                </Button>
              </>
            ) : (
              ''
            )}
            {row?.name === 'Cafe' || row?.name === 'SubCafe' ? (
              <></>
            ) : (
              <>
                {canDeleteRole ? (
                  <>
                    <UncontrolledTooltip
                      placement='top'
                      id={`grid-delete-${row?.id}`}
                      target={`grid-delete-${row?.id}`}
                    >
                      {'delete'}
                    </UncontrolledTooltip>
                    <ConfirmAlert
                      className='d-flex waves-effect btn btn-danger btn-sm'
                      eventId={`item-delete-${row?.id}`}
                      text={FM('are-you-sure')}
                      title={FM('delete-item', { name: row?.name })}
                      onClickYes={() => {
                        handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                      }}
                      onSuccessEvent={onSuccessEvent}
                      id={`grid-delete-${row?.id}`}
                    >
                      <Trash2 size={14} id='delete' />
                    </ConfirmAlert>
                  </>
                ) : (
                  ''
                )}
              </>
            )}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]

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
      <CustomDataTable<RoleResponseTypes>
        initialPerPage={20}
        isLoading={loadRolesResponse.isLoading}
        columns={columns}
        options={options}
        onSort={handleSort}
        defaultSortField={loadRolesResponse?.originalArgs?.jsonData?.sort}
        searchPlaceholder='search-name'
        paginatedData={loadRolesResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Roles

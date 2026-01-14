import { useState } from 'react'
import { Button, ButtonProps, Spinner, UncontrolledTooltip } from 'reactstrap'
import { getUniqId } from '@src/utility/Utils'
// import { getUniqId } from '@src/utility/Utils'

interface propsType {
  id?: string | any
  loading: boolean
  tooltip?: any
}
const LoadingButton = ({
  id = null,
  loading = false,
  tooltip = null,
  ...props
}: propsType & ButtonProps) => {
  const [uId, setId] = useState(props?.id ?? getUniqId('button'))
  return (
    <>
      {tooltip ? <UncontrolledTooltip target={uId}>{tooltip}</UncontrolledTooltip> : null}
      <Button id={uId} disabled={loading} {...{ ...props, loading: 'false' }}>
        {loading ? (
          <>
            <Spinner animation='border' size={'sm'}>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </>
        ) : (
          props.children
        )}
      </Button>
    </>
  )
}

export default LoadingButton

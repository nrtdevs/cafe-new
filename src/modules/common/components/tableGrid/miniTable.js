import { Col, Row } from 'reactstrap'
import { FM } from '@src/utility/Utils'

const MiniTable = ({
  labelProps = { md: 4 },
  label,
  icon = null,
  value,
  valueProps,
  rowProps,
  separatorProps = { md: 1, className: 'd-none d-md-block' }
}) => {
  if (value !== null && value !== undefined) {
    return (
      <>
        <Row noGutters className='mb-1 mb-md-0' {...rowProps}>
          <Col md='4' className='fw-bold' {...labelProps}>
            {icon ?? FM(label)}
          </Col>
          <Col md='1' {...separatorProps}>
            :
          </Col>
          <Col md='6' className='text-dark' {...valueProps}>
            {value}
          </Col>
        </Row>
      </>
    )
  } else {
    return null
  }
}

export default MiniTable

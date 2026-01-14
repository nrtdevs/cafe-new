import { Col, Row } from 'reactstrap'
import { FM } from '@src/utility/Utils'

const NoActiveModule = ({ module = 'this' }) => {
  return (
    <Row className='' style={{ height: '70vh' }}>
      <Col md='12' className='d-flex align-items-center justify-content-center h-100'>
        <div>
          <div className='h2 text-dark fw-bolder'>
            {FM(module)} {FM('module-inactive')}
          </div>
          <div className='p'>{FM('module-inactive-text')}</div>
        </div>
      </Col>
    </Row>
  )
}

export default NoActiveModule

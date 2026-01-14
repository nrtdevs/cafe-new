import CardCongratulations from '@src/exampleViews/ui-elements/cards/advance/CardCongratulations'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { Col, Row } from 'reactstrap'
// ** Avatar Imports
import { useActivityGraphMutation } from '@src/modules/cafeapp/redux/RTKFiles/ImportsRTK'
import { useContext, useEffect } from 'react'
import ApexLineChart from './LineReports'
function Dashboard() {
  const { colors } = useContext(ThemeColors)
  const [activityGraph, activityStats] = useActivityGraphMutation()
  const options = {
    chart: {
      type: 'bar'
    },
    series: [
      {
        name: 'sales',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      }
    ],
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    }
  }
  useEffect(() => {
    activityGraph({})
  }, [])

  return (
    <div id='dashboard-analytics'>
      <Row className='match-height'>
        <Col lg='12' sm='12'>
          <CardCongratulations />
        </Col>
        <Col>
          <ApexLineChart direction={'ltr'} warning='#ae34eb' chartData={activityStats?.data} />
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

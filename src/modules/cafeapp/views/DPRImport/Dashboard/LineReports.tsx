// ** Third Party Components
import { formatDate, isValidArray, rand } from '@src/utility/Utils'
import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'
import { ArrowDown } from 'react-feather'

// ** Reactstrap Imports
import { Badge, Card, CardBody, CardHeader, CardSubtitle, CardTitle } from 'reactstrap'

const ApexLineChart = ({
  direction,
  warning,
  chartData = []
}: {
  direction: string
  warning: string
  chartData: any
}) => {
  // ** Chart Options
  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          // reset: true | '<img src="/static/icons/reset.png" width="20">',
          customIcons: []
        },
        export: {
          csv: {
            filename: undefined,
            columnDelimiter: ',',
            headerCategory: 'category',
            headerValue: 'value',
            dateFormatter(timestamp: any) {
              return new Date(timestamp).toDateString()
            }
          },
          svg: {
            filename: undefined
          },
          png: {
            filename: undefined
          }
        },
        autoSelected: 'zoom'
      }
    },

    markers: {
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeColors: [
        '#194798',
        '#f9a825',
        '#00d25b',
        '#ff5b5b',
        '#7367f0',
        '#00cfe8',
        '#fcb92c',
        '#ff679b',
        '#1ee0ac'
      ],
      colors: [
        '#194798',
        '#f9a825',
        '#00d25b',
        '#ff5b5b',
        '#7367f0',
        '#00cfe8',
        '#fcb92c',
        '#ff679b',
        '#1ee0ac'
      ]
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    colors: [
      '#194798',
      '#f9a825',
      '#00d25b',
      '#ff5b5b',
      '#7367f0',
      '#00cfe8',
      '#fcb92c',
      '#ff679b',
      '#1ee0ac'
    ],
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      custom(data) {
        return `<div class='px-1 py-50'>
              <span>${data.series[data.seriesIndex][data.dataPointIndex]}%</span>
            </div>`
      }
    },
    xaxis: {
      categories: isValidArray(chartData?.data)
        ? chartData?.data?.map((a: any) => formatDate(a?.date, 'DD MMM YYYY'))
        : []
    },
    yaxis: {
      opposite: direction === 'rtl'
    }
  }

  // ** Chart Series
  const series = [
    {
      data: isValidArray(chartData?.data) ? chartData?.data?.map((a: any) => a?.taskCount) : []
    },
    {
      data: isValidArray(chartData?.data)
        ? chartData?.data?.map((a: any) => a?.taskCount - rand(1, 10))
        : []
    }
    // {
    //   data: [0, 100, 0, 100, 0, 100, 0, 100, 0, 100, 0, 100, 0, 300]
    // }
  ]

  return (
    <Card>
      <CardHeader className='d-flex flex-sm-row flex-column justify-content-md-between align-items-start justify-content-start'>
        <div>
          <CardTitle className='mb-75' tag='h4'>
            Balance
          </CardTitle>
          <CardSubtitle className='text-muted'>Commercial networks & enterprises</CardSubtitle>
        </div>
        <div className='d-flex align-items-center flex-wrap mt-sm-0 mt-1'>
          <h5 className='fw-bolder mb-0 me-1'>$ 100,000</h5>
          <Badge color='light-secondary'>
            <ArrowDown size={13} className='text-danger' />
            <span className='align-middle ms-25'>20%</span>
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <Chart options={options} series={series} type='line' height={400} />
      </CardBody>
    </Card>
  )
}

export default ApexLineChart

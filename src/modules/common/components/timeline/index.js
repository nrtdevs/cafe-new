// ** Third Party Components
import classnames from 'classnames'
import Proptypes from 'prop-types'

import { ThemeColors } from '@src/utility/context/ThemeColors'
import { useContext } from 'react'
import { Edit, Flag, Lock, MapPin, MessageSquare, MoreVertical, Send, Video } from 'react-feather'
import { Link } from 'react-router-dom'
import { Card, CardBody, Col, Row, UncontrolledTooltip } from 'reactstrap'
import { IconSizes } from '@src/utility/Const'
import { FM } from '@src/utility/Utils'
import DropDownMenu from '../dropdown'
import BsTooltip from '../tooltip'
const Timeline = (props) => {
  const { colors } = useContext(ThemeColors)
  // ** Props
  const { data, tag, className } = props

  // ** Custom Tagg
  const Tag = tag ? tag : 'ul'

  return (
    <Tag
      className={classnames('timeline', {
        [className]: className
      })}
    >
      {data.map((item, i) => {
        const ItemTag = item.tag ? item.tag : 'li'

        return (
          <ItemTag
            key={i}
            className={classnames('timeline-item', {
              [item.className]: className
            })}
          >
            <span
              className={classnames('timeline-point', {
                [`timeline-point-${item.color}`]: item.color,
                'timeline-point-indicator': !item.icon
              })}
            >
              {item.icon ? item.icon : null}
            </span>
            <div className='timeline-event'>
              <Card className={classnames('animate__animated animate__bounceIn')}>
                <CardBody>
                  <div className='role-heading'>
                    <Row>
                      <div
                        className={classnames(
                          'd-flex justify-content-between flex-sm-row flex-column',
                          {
                            'mb-sm-0 mb-1': item.startDate
                          }
                        )}
                      >
                        {/* <span className='rounded'> <BsTooltip title={item?.title} Tag={"h4"} className='fw-bolder text-truncate  mb-0 mt-0 text-capitalize'>{item?.title}</BsTooltip></span> */}
                        {/* <h6>{item.title}</h6> */}

                        {item.startTime ? (
                          <>
                            <UncontrolledTooltip target={'start-time'}>
                              {FM('start-time')}
                            </UncontrolledTooltip>
                            {/* <UncontrolledTooltip target={"end-time"}>{FM("end-time")}</UncontrolledTooltip> */}
                            <span
                              id='start-time'
                              className={classnames(
                                'timeline-event-time mb-5px text-success text-small-18 fw-bold',
                                {
                                  [item.metaClassName]: item.metaClassName
                                }
                              )}
                            >
                              {item.startTime} - {item.endTime}
                            </span>

                            {/* <BsTooltip
                                                        className={classnames('timeline-event-time mb-5px text-danger text-small-18 fw-bold', {
                                                            [item.metaClassName]: item.metaClassName
                                                        })}
                                                    >
                                                        {item.endTime}
                                                    </BsTooltip> */}
                          </>
                        ) : null}
                      </div>

                      <Col xs='10'>
                        <span className='rounded'>
                          {' '}
                          <BsTooltip
                            title={item?.title}
                            Tag={'h4'}
                            className='fw-bolder text-truncate  mb-0 mt-0 text-capitalize'
                          >
                            {item?.title}
                          </BsTooltip>
                        </span>
                      </Col>
                      {/* <Col  xs="10">
                                               
                                                <p
                                                    className={classnames({
                                                        'mb-0': i === data.length - 1 && !item.customContent
                                                    })}
                                                >
                                                    {item.content}
                                                </p>
                                            </Col> */}
                      <Col xs='2' className='d-flex align-items-center justify-content-end pe-1'>
                        <DropDownMenu
                          tooltip={FM(`menu`)}
                          component={
                            <MoreVertical
                              color={colors.primary.main}
                              size={IconSizes.MenuVertical}
                            />
                          }
                          options={[
                            /* {
                                                             icon: <Eye size={14} />,
                                                             to: { pathname: getPath('companies.detail', { id: item.id }), state: { data: item } },
                                                             name: FM("view"),
                                                             onClick: () => {
                                                                 
                                                             }
                                                         },*/
                            {
                              icon: <Send size={14} />,
                              onClick: () => {
                                // setShowAdd(true)
                                // setEdit(item)
                              },
                              // to: { pathname: getPath('branch.update', { id: item.id }), state: { data: item } },
                              name: FM('edit')
                            },

                            {
                              icon: <Lock size={14} />,
                              name: FM('license'),
                              onClick: () => {}
                            },
                            {
                              icon: <MessageSquare size={14} />,
                              name: FM('Message'),
                              onClick: () => {}
                            },
                            item.menu ? item.menu : null
                          ]}
                        />
                      </Col>
                    </Row>

                    {item?.addressUrl ? (
                      <p className='text-truncate text-primary text-small-12 fw-bold'>
                        <BsTooltip
                          className='ms-1'
                          Tag={Link}
                          role={'button'}
                          to={item?.addressUrl}
                          title={FM(item?.addressUrl)}
                        >
                          <MapPin color={colors.success.main} size='18' />
                        </BsTooltip>
                        <BsTooltip
                          className='ms-1'
                          Tag={Link}
                          role={'button'}
                          to={item?.videoUrl}
                          title={FM(item?.videoUrl)}
                        >
                          <Video color={colors.danger.main} size='18' />
                        </BsTooltip>
                        <BsTooltip
                          className='ms-1'
                          Tag={Link}
                          role={'button'}
                          to={item?.informationUrl}
                          title={FM(item?.informationUrl)}
                        >
                          <Flag color={colors.primary.main} size='18' />
                        </BsTooltip>
                      </p>
                    ) : null}
                    <p className='mb-5px mt-1'>
                      {/* <MiniTable
                                                labelProps={{ md: "3" }}
                                                valueProps={{ md: 8 }}
                                                label={"start-date"}
                                                value={formatDate(item?.startDate, "DD MMMM, YYYY")}

                                            />
                                            <MiniTable
                                                labelProps={{ md: "3" }}
                                                valueProps={{ md: 8 }}
                                                label={"end-date"}
                                                value={formatDate(item?.endDate, "DD MMMM, YYYY")}

                                            />
                                            {item?.videoUrl ? <MiniTable
                                                labelProps={{ md: "3" }}
                                                valueProps={{ md: 8 }}
                                                label={"video-url"}
                                                //value={<BsTooltip title={FM(item?.videoUrl)}>{item?.videoUrl}</BsTooltip>}
                                                value={<BsTooltip className="ms-1" Tag={Link} role={"button"} to={item?.videoUrl} title={FM(item?.videoUrl)}>{item?.videoUrl} <Link2 className='ms-1' /></BsTooltip>}
                                            /> : null}
                                            {item?.informationUrl ? <MiniTable
                                                labelProps={{ md: "3" }}
                                                valueProps={{ md: 8 }}
                                                label={"info-url"}
                                                value={<BsTooltip className="ms-1" Tag={Link} role={"button"} to={item?.informationUrl} title={FM(item?.informationUrl)}>{item?.informationUrl}<Link2 className='ms-1' /></BsTooltip>}
                                            /> : null} */}

                      {item.miniTable ? item.miniTable : null}
                    </p>

                    {/* text-truncate */}
                    <BsTooltip title={FM('description')}>
                      <p className=' text-primary text-small-12 fw-bold'>{item?.description}</p>
                    </BsTooltip>
                  </div>
                  <hr />
                  <div className='d-flex  justify-content-end align-items-end'>
                    <div>
                      <Link>
                        {' '}
                        <Edit color={colors.primary.main} size='14' />
                      </Link>
                    </div>

                    {/* <BsTooltip Tag={Link} title={FM("edit")} role={"button"}>
                                            <Edit color={colors.primary.main} size="18" />
                                        </BsTooltip>
                                        <BsTooltip className="ms-1" Tag={Link} title={FM("view")} role={"button"}>
                                            <Eye color={colors.info.main} size="18" />
                                        </BsTooltip>
                                        
                                       <BsTooltip className="ms-1" Tag={Link} title={FM("followups")} role={"button"}>
                                            {FM("followups")}
                                        </BsTooltip> */}
                  </div>
                </CardBody>
              </Card>
            </div>
          </ItemTag>
        )
      })}
    </Tag>
  )
}

export default Timeline

// ** PropTypes
Timeline.propTypes = {
  tag: Proptypes.string,
  className: Proptypes.string,
  data: Proptypes.array.isRequired
}

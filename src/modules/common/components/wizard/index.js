// ** React Imports
// ** Third Party Components
import Stepper from 'bs-stepper'
import 'bs-stepper/dist/css/bs-stepper.min.css'
import classnames from 'classnames'
import { PropTypes } from 'prop-types'
import { forwardRef, Fragment, useEffect, useState } from 'react'
import { ChevronRight } from 'react-feather'
import ScrollBar from 'react-perfect-scrollbar'
// ** Styles
import 'react-perfect-scrollbar/dist/css/styles.css'
import { Badge } from 'reactstrap'
import '../../../@core/scss/base/plugins/forms/form-wizard.scss'
import { Events } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import Hide from '@src/utility/Hide'
import Show from '@src/utility/Show'

const Wizard = forwardRef((props, ref) => {
  // ** Props
  const {
    stepClass,
    perfectScroll = true,
    contentClass,
    withShadow = false,
    badgePosition = 'right',
    withBadge = false,
    badgeColor = 'success',
    type,
    className,
    contentClassName,
    headerClassName,
    steps,
    currentIndex = () => {},
    separator,
    options,
    instance
  } = props

  // ** State
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollEnabled, setScrollEnabled] = useState(false)

  // ** Vars
  let stepper = null

  // ** Step change listener on mount
  useEffect(() => {
    stepper = new Stepper(ref.current, options)

    ref.current.addEventListener('shown.bs-stepper', function (event) {
      setActiveIndex(event.detail.indexStep)
    })

    if (instance) {
      instance(stepper)
    }
  }, [])

  useEffect(() => {
    Emitter.on(Events.reactSelect, setScrollEnabled)
    // return () => {
    //     Emitter.off(Events.Unauthenticated, e => setUnauthenticated(false))
    // }
  }, [])

  useEffect(() => {
    setScrollEnabled(perfectScroll)
  }, [perfectScroll])

  // ** Renders Wizard Header
  const renderHeader = () => {
    return steps.map((step, index) => {
      return (
        <Fragment key={step.id}>
          {index !== 0 && index !== steps.length ? <div className='line'>{separator}</div> : null}
          <div
            onClick={() => {
              currentIndex(activeIndex)
            }}
            className={classnames('step', {
              crossed: activeIndex > index,
              active: index === activeIndex,
              shadow: index === activeIndex && withShadow,
              [stepClass]: stepClass
            })}
            data-target={`#${step.id}`}
          >
            <button type='button' className='step-trigger'>
              <span className={`position-relative bs-stepper-box ${step?.bg}`}>
                {step.icon ? step.icon : index + 1}
                <Show IF={withBadge}>
                  <Badge
                    className={classnames({
                      'step-badge-right': badgePosition === 'right',
                      'step-badge-left': badgePosition === 'left'
                    })}
                    color={index === activeIndex ? badgeColor : 'secondary'}
                    pill
                  >
                    {index + 1}
                  </Badge>
                </Show>
              </span>

              <span className='bs-stepper-label'>
                <span className='bs-stepper-title'>{step.title}</span>
                {step.subtitle ? (
                  <span
                    className={classnames('bs-stepper-subtitle', {
                      'text-dark': index === activeIndex
                    })}
                  >
                    {step.subtitle}
                  </span>
                ) : null}
              </span>
            </button>
          </div>
        </Fragment>
      )
    })
  }

  // ** Renders Wizard Content
  const renderContent = () => {
    return steps.map((step, index) => {
      return (
        <div
          className={classnames('content', {
            [contentClassName]: contentClassName,
            'active dstepper-block': activeIndex === index
          })}
          id={step.id}
          key={step.id}
        >
          <Show IF={scrollEnabled}>
            <ScrollBar>{step.content}</ScrollBar>
          </Show>
          <Hide IF={scrollEnabled}>
            <div className='test'>{step.content}</div>
          </Hide>
        </div>
      )
    })
  }

  return (
    <div
      ref={ref}
      className={classnames('bs-stepper', {
        [className]: className,
        vertical: type === 'vertical',
        'vertical wizard-modern': type === 'modern-vertical',
        'wizard-modern': type === 'modern-horizontal'
      })}
    >
      <div className={classnames('bs-stepper-header', { [headerClassName]: headerClassName })}>
        {renderHeader()}
      </div>
      <div
        className={classnames('bs-stepper-content', {
          [contentClass]: contentClass
        })}
      >
        {renderContent()}
      </div>
    </div>
  )
})

export default Wizard

// ** Default Props
Wizard.defaultProps = {
  options: {},
  type: 'horizontal',
  separator: <ChevronRight size={17} />
}

// ** PropTypes
Wizard.propTypes = {
  type: PropTypes.string,
  withBadge: PropTypes.bool,
  badgeColor: PropTypes.string,
  instance: PropTypes.func,
  stepClass: PropTypes.string,
  badgePosition: PropTypes.string,
  options: PropTypes.object,
  className: PropTypes.string,
  separator: PropTypes.element,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      icon: PropTypes.any,
      content: PropTypes.any.isRequired
    })
  ).isRequired
}

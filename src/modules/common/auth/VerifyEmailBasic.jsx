// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button, Card, CardBody, CardText, CardTitle, Form, Input } from 'reactstrap'

// app logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/chaihojaye.svg'

// ** Styles
import { FM } from '@src/utility/Utils'
import '@styles/react/pages/page-authentication.scss'

const VerifyEmailBasic = () => {
  return (
    <div className='auth-wrapper auth-basic px-2'>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody>
            <Link className='brand-logo' to='/' onClick={(e) => e.preventDefault()}>
              <AppLogo />
            </Link>
            <CardTitle tag='h2' className='fw-bolder mb-1'>
              {FM('verify-email')} 💬
            </CardTitle>
            <CardText className='mb-75'>
              {FM(
                'we-sent-a-verification-code-to-your-email-enter-the-code-from-the-email-in-the-field-below'
              )}
            </CardText>
            <CardText className='fw-bolder mb-2'>an******ey@gmail.com</CardText>
            <Form className='mt-2' onSubmit={(e) => e.preventDefault()}>
              <h6>{FM('type-your-6-digit-security-code')}</h6>
              <div className='auth-input-wrapper d-flex align-items-center justify-content-between'>
                <Input
                  autoFocus
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
                <Input
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
                <Input
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
                <Input
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
                <Input
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
                <Input
                  maxLength='1'
                  className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                />
              </div>
            </Form>
            <Button block tag={Link} to='/' color='primary'>
              {FM('sign-in')}
            </Button>
            <p className='text-center mt-2'>
              <span>{FM('didnt-get-the-code')}</span>{' '}
              <a href='/' onClick={(e) => e.preventDefault()}>
                {FM('resend')}
              </a>{' '}
              {/* <span>or</span>{' '}
              <a href='/' onClick={(e) => e.preventDefault()}>
                Call us
              </a> */}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default VerifyEmailBasic

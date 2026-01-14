// ** React Imports
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// ** Icons Imports

// ** Custom Components

// ** Reactstrap Imports
import { Card, CardBody, CardText, CardTitle, Form, Label } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// app logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/chaihojaye.svg'
import LoadingButton from '@modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import themeConfig from '@src/configs/themeConfig'
import { handleLogin } from '@src/redux/authentication'
import { useAppDispatch } from '@src/redux/store'
import { Patterns } from '@src/utility/Const'
import { AbilityContext } from '@src/utility/context/Can'
import { loginApi } from '@src/utility/http/Apis/auth'
import { FM, isDebug, isValid } from '@src/utility/Utils'
import { useCallback, useContext, useEffect, useState } from 'react'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useForm } from 'react-hook-form'
import Emitter from '@src/utility/Emitter'
const defaultValues = {
  //   password: '12345678',
  //   email: 'admin@gmail.com'
}

const extraPermissions = [
  //   {
  //     action: 'manage',
  //     subject: 'all'
  //   }
]

const LoginWithCaptcha = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const ability = useContext(AbilityContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect_to')
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const { executeRecaptcha } = useGoogleReCaptcha()

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(
    async (jsonData) => {
      if (!executeRecaptcha) {
        console.log('Execute recaptcha not yet available')
        return
      }
      setLoading(jsonData ? true : false)
      const token = await executeRecaptcha('login')
      // Do whatever you want with the token
      if (isValid(token)) {
        setLoading(false)

        if (isValid(jsonData)) {
          loginApi({
            jsonData,
            loading: setLoading,
            success: (res) => {
              const permissions =
                res?.data?.permissions?.map((a) => ({
                  action: a.action,
                  subject: a?.subject
                })) ?? []
              const data = {
                ...res.data,
                accessToken: res.data.access_token,
                refreshToken: res.data.access_token,
                ability: permissions.concat(extraPermissions)
              }
              dispatch(handleLogin(data))
              ability.update(data?.ability)
              if (data?.password_last_updated === null) {
                Emitter.emit('openChangePasswordModal', { doNotClose: true })
                navigate(redirectUrl ? redirectUrl : '/meetings')
                // navigate(redirectUrl ? redirectUrl : '/meetings', { state: { showChangePassword: true } })
              } else {
                navigate(redirectUrl ? redirectUrl : '/meetings')
              }
            }
          })
        }
      } else {
        setLoading(false)
      }
    },
    [executeRecaptcha]
  )

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify()
  }, [handleReCaptchaVerify])

  const onSubmit = (jsonData) => {
    handleReCaptchaVerify(jsonData)
  }

  return (
    <div className='auth-wrapper auth-basic px-2'>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody>
            <Link className='brand-logo logo-lg' to='/' onClick={(e) => e.preventDefault()}>
              <AppLogo />
              {/* <h2 className='brand-text text-primary ms-1'>{themeConfig.app.appName}</h2> */}
            </Link>
            <CardTitle tag='h4' className='mb-1'>
              {FM('welcome-to')} {themeConfig.app.appName}! 👋
            </CardTitle>
            <CardText className='mb-2'>
              {FM('please-sign-in-to-your-account-and-start-the-adventure')}
            </CardText>
            <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
              <FormGroupCustom
                control={control}
                name='email'
                type='email'
                className={'mb-1'}
                rules={{ required: true, pattern: Patterns.EmailOnly }}
                label={FM('email')}
              />
              <div className='d-flex justify-content-between'>
                <Label className='form-label' for='login-password'>
                  {FM('password')}
                </Label>
                <Link to='/forgot-password'>
                  <small>{FM('forgot-password')}</small>
                </Link>
              </div>
              <FormGroupCustom
                control={control}
                name='password'
                type='password'
                className={'mb-1'}
                rules={{ required: true }}
                noLabel
              />
              {/* <p className='small text-muted'>
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a href='https://policies.google.com/privacy'>Privacy Policy</a> and{' '}
                  <a href='https://policies.google.com/terms'>Terms of Service</a> apply.
                </p> */}
              <LoadingButton loading={loading} className='mb-2' color='primary' block>
                {FM('sign-in')}
              </LoadingButton>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

const LoginBasic = () => {
  useEffect(() => {
    if (!isDebug) {
      document.addEventListener('contextmenu', (event) => event.preventDefault())

      document.onkeydown = function (e) {
        // disable F12 key
        if (e.keyCode == 123) {
          return false
        }

        // disable I key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
          return false
        }

        // disable J key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 74) {
          return false
        }

        // disable U key
        if (e.ctrlKey && e.keyCode == 85) {
          return false
        }
      }
    }
    return () => {
      document.removeEventListener('contextmenu', () => {})
    }
  }, [])
  return (
    <GoogleReCaptchaProvider reCaptchaKey='6LcsC_gkAAAAAHbpA0PZL52J4xwLL-jjWv_B19aK'>
      <LoginWithCaptcha />
    </GoogleReCaptchaProvider>
  )
}

export default LoginBasic

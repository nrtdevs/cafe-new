// ** React Imports
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// ** Icons Imports

// ** Custom Components

// ** Reactstrap Imports
import { Card, CardBody, CardText, CardTitle, Col, Form, Label, Row } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// app logo
// import logos from '@@assets/images/logo/logo copy.png'
import { ReactComponent as AppLogo } from '@@assets/images/logo/chaihojaye.svg'
import logo from '@@assets/images/logo/logo.png'
import LoadingButton from '@modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import themeConfig from '@src/configs/themeConfig'
import { useAppDispatch } from '@src/redux/store'
import { Patterns } from '@src/utility/Const'
import Show from '@src/utility/Show'
import { FM } from '@src/utility/Utils'
import { AbilityContext } from '@src/utility/context/Can'
import { login } from '@src/utility/http/Apis/auth'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
const defaultValues = {
      password: '',
      email: ''
}

const extraPermissions = [
    {
        action: 'manage',
        subject: 'all'
    }
]

const Login = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const ability = useContext(AbilityContext)
    const [searchParams, setSearchParams] = useSearchParams()
    const redirectUrl = searchParams.get('redirect_to')
    const {
        control,
        setError,
        handleSubmit,
        formState: { errors }
    } = useForm({ defaultValues })

    const onSubmit = (jsonData: any) => {
        // console.log('jsonData', jsonData)
        // try {
        //   loginApi({
        //     jsonData,
        //     loading: setLoading,
        //     success: (res) => {
        //       setOtpSent(true)
        //     }
        //   })
        // } catch (error) {
        //   console.log('error', error)
        // }
        // dispatch(
        //   handleLogin({
        //     id: 1,
        //     name: 'admin',
        //     accessToken: 'res?.data.access_token',
        //     refreshToken: 'res?.data.access_token',
        //     ability: extraPermissions
        //   })
        // )
        // ability.update(extraPermissions)
        // navigate(redirectUrl ? redirectUrl : '/home')

        login({
            formData: {
                ...jsonData
            },
            redirect: true,
            error: (e) => { },
            loading: setLoading,
            success: (user) => {
                // log('user', user)
                // if (isValidArray(user?.payload?.languages)) {
                //   const lang = user?.payload?.languages[0]
                //   if (lang.mode === '2') {
                //     setValue(true)
                //   } else {
                //     setValue(false)
                //   }
                //   i18n.changeLanguage(String(lang?.id))
                // }
            },
            dispatch,
            ability,
            navigate
        })
    }
    return (
        <>
            <div className='auth-advanced'>
                <Row className='align-items-center h-100'>
                    <Col md='6' className='d-none d-lg-block'>
                        <div className='logo-bg-bottom'></div>
                        <div className='logo-bg-bottom-2'></div>
                        <div className='logo-bg'>
                            <div className='logo-content h-1'>
                                {/* <AppLogo /> */}
                                <img className='mt-1' src={logo} height={100} width={100} />
                            </div>
                        </div>
                        {/* <div className='bg-bottom'></div> */}
                    </Col>
                    <Col
                        md='6'
                        className='col-100vh justify-content-lg-start justify-content-center align-items-center d-flex'
                    >
                        <div className='card-group'>
                            <div className='login-card'></div>
                            <div className='login-card-1'>
                                <div className='card-content'>
                                    <h2>{FM('sign-in')}</h2>
                                    <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
                                        <FormGroupCustom
                                            control={control}
                                            name='email'
                                            type='email'
                                            isDisabled={otpSent}
                                            noLabel
                                            className={'mb-1'}
                                            rules={{ required: true, pattern: Patterns.EmailOnly }}
                                            label={FM('email')}
                                        />

                                        <FormGroupCustom
                                            control={control}
                                            name='password'
                                            type='password'
                                            className={'mb-1'}
                                            isDisabled={otpSent}
                                            rules={{ required: true }}
                                            noLabel
                                        />

                                        <Row>
                                            {/* <Col>
                        <div className='d-flex captcha'>
                          <img
                            src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Captcha-smwm.svg/1200px-Captcha-smwm.svg.png'
                            className='img-fluid'
                          />
                          <LoadingButton
                            loading={false}
                            className='btn-icon'
                            size='sm'
                            color='primary'
                            block
                            type='reset'
                          >
                            <RotateCcw size={18} />
                          </LoadingButton>
                        </div>
                      </Col> */}
                                            <Show IF={otpSent}>
                                                <Col>
                                                    <FormGroupCustom
                                                        control={control}
                                                        name='otp'
                                                        type='text'
                                                        placeholder={FM('enter-otp')}
                                                        className={'mb-1'}
                                                        rules={{ required: false }}
                                                        noLabel
                                                    />
                                                </Col>
                                            </Show>
                                        </Row>
                                        {/* <p className='small text-muted'>
              This site is protected by reCAPTCHA and the Google{' '}
              <a href='https://policies.google.com/privacy'>Privacy Policy</a> and{' '}
              <a href='https://policies.google.com/terms'>Terms of Service</a> apply.
            </p> */}
                                        {/* <Row>
                      <Col>
                        <div className='d-flex captcha'>
                          <img
                            src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Captcha-smwm.svg/1200px-Captcha-smwm.svg.png'
                            className='img-fluid'
                          />
                          <LoadingButton
                            loading={false}
                            className='btn-icon'
                            size='sm'
                            color='primary'
                            block
                            type='reset'
                          >
                            <RotateCcw size={18} />
                          </LoadingButton>
                        </div>
                      </Col>
                      <Col>
                        <FormGroupCustom
                          control={control}
                          name='captcha'
                          type='text'
                          placeholder={FM('enter-captcha')}
                          className={'mb-1'}
                          rules={{ required: false }}
                          noLabel
                        />
                      </Col>
                    </Row> */}
                                        <LoadingButton loading={loading} className='mb-1' color='primary' block>
                                            {otpSent ? FM('sign-in') : FM('send-otp')}
                                        </LoadingButton>
                                        <div className='d-flex justify-content-center'>
                                            <Link to='/forgot-password'>
                                                <small>{FM('forgot-password')}</small>
                                            </Link>
                                        </div>
                                        <div className='copy mt-2 text-center'>
                                            ©{new Date().getFullYear()} cafe App
                                        </div>
                                    </Form>
                                </div>
                            </div>
                            <div className='login-card-2'></div>
                        </div>
                    </Col>
                </Row>
                {/* <div className='bottom-text'>
          <p className='border-bottom'>India It Services</p>
          <p>Enabling Business. Empowering You</p>
        </div> */}
            </div>
        </>
    )
    return (
        <>
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
        </>
    )
}

export default Login

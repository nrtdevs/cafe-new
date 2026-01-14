// ** React Imports
import { Link, useNavigate, useParams } from 'react-router-dom'

// ** Icons Imports
import { ChevronLeft } from 'react-feather'

// ** Custom Components
import InputPassword from '@components/input-password-toggle'

// ** Reactstrap Imports
import { Card, CardBody, CardTitle, CardText, Form, Label, Button } from 'reactstrap'

// app logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/chaihojaye.svg'

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { FM } from '@src/utility/Utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { resetPasswordApi, sendResetLinkApi } from '@src/utility/http/Apis/auth'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import { Patterns } from '@src/utility/Const'
import LoadingButton from '@modules/common/components/buttons/LoadingButton'

const ResetPasswordBasic = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = (jsonData) => {
    if (jsonData.password === jsonData?.confirm_password) {
      resetPasswordApi({
        jsonData: {
          ...jsonData,
          token: params?.token ?? ''
        },
        loading: setLoading,
        success: (res) => {
          SuccessToast(res.message)
          navigate('/login')
        }
      })
    } else {
      setError('confirm_password', { type: 'validate', message: FM('password-did-not-matched') })
    }
  }
  return (
    <div className='auth-wrapper auth-basic px-2'>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody>
            <Link className='brand-logo' to='/' onClick={(e) => e.preventDefault()}>
              <AppLogo />
            </Link>
            <CardTitle tag='h4' className='mb-1'>
              {FM('reset-password')} 🔒
            </CardTitle>
            <CardText className='mb-2'>
              {FM('your-new-password-must-be-different-from-previously-used-passwords')}
            </CardText>
            <Form className='auth-reset-password-form mt-2' onSubmit={handleSubmit(onSubmit)}>
              <FormGroupCustom
                rules={{ required: true, pattern: Patterns.Password }}
                control={control}
                name='password'
                tooltip={FM('password-must-contain-at-least-one-number')}
                type='password'
                label={FM('password')}
                className='mb-1'
              />
              <FormGroupCustom
                rules={{ required: true, pattern: Patterns.Password }}
                control={control}
                name='confirm_password'
                // message={FM('password-must-contain-at-least-one-number')}
                type='password'
                label={FM('confirm-password')}
                className='mb-1'
              />
              <LoadingButton loading={loading} color='primary' block>
                {FM('set-new-password')}
              </LoadingButton>
            </Form>
            <p className='text-center mt-2'>
              <Link to='/login'>
                <ChevronLeft className='rotate-rtl me-25' size={14} />
                <span className='align-middle'>{FM('back-to-login')}</span>
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordBasic

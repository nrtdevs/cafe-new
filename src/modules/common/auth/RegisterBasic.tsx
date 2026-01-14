// ** React Imports
import { Link } from 'react-router-dom'

// ** Icons Imports
import { Facebook, Twitter, Mail, GitHub } from 'react-feather'

// ** Custom Components
import InputPasswordToggle from '@components/input-password-toggle'

// ** Reactstrap Imports
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Form,
  Label,
  Input,
  Button,
  Row,
  Col
} from 'reactstrap'

// app logo
import { ReactComponent as AppLogo } from '@@assets/images/logo/chaihojaye.svg'

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { FM, setInputErrors, SuccessToast } from '@src/utility/Utils'
import { useForm } from 'react-hook-form'
import FormGroupCustom from '@modules/common/components/formGroupCustom/FormGroupCustom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { UserData } from '@src/utility/types/typeAuthApi'
import { useEffect } from 'react'
import LoadingButton from '../components/buttons/LoadingButton'
import { useCreateOrUpdateUserMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'

// validation schema
const userFormSchema = {
  name: yup.string().required(),
  email: yup.string().email().required(FM('email-must-be-a-valid-email')),
  designation: yup.string().required(),
  mobile_number: yup
    .string()
    .required()
    .when({
      is: (values: string) => values?.length > 0,
      then: (schema) =>
        schema
          .min(10, FM('mobile-number-must-be-at-least-10-characters'))
          .max(12, FM('mobile-number-must-be-at-most-12-characters'))
          .required(),
      otherwise: (schema) => schema.notRequired().min(0).max(0)
    }),
  password: yup.string().required(),
  'confirm-password': yup.string().oneOf([yup.ref('password'), null], FM('passwords-must-match'))
}
// validate
const schema = yup.object(userFormSchema).required()

const RegisterBasic = () => {
  // form hook
  const form = useForm<UserData>({
    resolver: yupResolver(schema)
  })

  // create user mutation
  const [createUser, createUserResponse] = useCreateOrUpdateUserMutation()

  // handle save user
  const handleSaveUser = (userData: UserData) => {
    createUser({
      jsonData: userData
    })
  }

  // handle user create response
  useEffect(() => {
    if (!createUserResponse.isUninitialized) {
      if (createUserResponse.isSuccess) {
        SuccessToast(FM('user-created-successfully'))
      } else if (createUserResponse.isError) {
        // handle error
        const errors: any = createUserResponse.error
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [createUserResponse])

  return (
    <div className='auth-wrapper auth-basic px-2'>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody>
            <Link className='brand-logo logo-lg' to='/' onClick={(e) => e.preventDefault()}>
              <AppLogo />
            </Link>
            <CardTitle tag='h4' className='mb-25 text-left'>
              {FM('create-an-account')}
            </CardTitle>
            <p className='text-muted'>{FM('create-account-description')}</p>
            <Form onSubmit={form.handleSubmit(handleSaveUser)}>
              {/* submit form on enter button!! */}
              <button className='d-none'></button>
              <Row>
                <Col md='12'>
                  <p className='text-dark'>{FM('personal-details')}</p>
                </Col>
                <Col md='12'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('name')}
                    name='name'
                    type='text'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>

                <Col md='6'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('mobile-number')}
                    name='mobile_number'
                    type='number'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='6'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('designation')}
                    name='designation'
                    type='text'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='12'>
                  <p className='text-dark'>{FM('login-details')}</p>
                </Col>
                <Col md='12'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('email')}
                    name='email'
                    type='email'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='6'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('password')}
                    name='password'
                    type='password'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='6'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('confirm-password')}
                    name='confirm-password'
                    type='password'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Row>
              <LoadingButton loading={createUserResponse.isLoading} color='primary' block>
                {FM('register')}
              </LoadingButton>
            </Form>
            <p className='text-center mt-2'>
              <span className='me-25'>{FM('already-have-an-account')}</span>
              <Link to='/login'>
                <span>{FM('sign-in')}</span>
              </Link>
            </p>
            {/* <div className='divider my-2'>
              <div className='divider-text'>or</div>
            </div>
            <div className='auth-footer-btn d-flex justify-content-center'>
              <Button color='facebook'>
                <Facebook size={14} />
              </Button>
              <Button color='twitter'>
                <Twitter size={14} />
              </Button>
              <Button color='google'>
                <Mail size={14} />
              </Button>
              <Button className='me-0' color='github'>
                <GitHub size={14} />
              </Button>
            </div> */}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default RegisterBasic

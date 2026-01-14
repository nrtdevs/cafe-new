// ** React Imports
import { lazy } from 'react'

const Login = lazy(() => import('@src/exampleViews/pages/authentication/Login'))
const LoginBasic = lazy(() => import('@src/exampleViews/pages/authentication/LoginBasic'))
const LoginCover = lazy(() => import('@src/exampleViews/pages/authentication/LoginCover'))

const Register = lazy(() => import('@src/exampleViews/pages/authentication/Register'))
const RegisterBasic = lazy(() => import('@src/exampleViews/pages/authentication/RegisterBasic'))
const RegisterCover = lazy(() => import('@src/exampleViews/pages/authentication/RegisterCover'))
const RegisterMultiSteps = lazy(() =>
  import('@src/exampleViews/pages/authentication/register-multi-steps')
)

const ForgotPassword = lazy(() => import('@src/exampleViews/pages/authentication/ForgotPassword'))
const ForgotPasswordBasic = lazy(() =>
  import('@src/exampleViews/pages/authentication/ForgotPasswordBasic')
)
const ForgotPasswordCover = lazy(() =>
  import('@src/exampleViews/pages/authentication/ForgotPasswordCover')
)

const ResetPasswordBasic = lazy(() =>
  import('@src/exampleViews/pages/authentication/ResetPasswordBasic')
)
const ResetPasswordCover = lazy(() =>
  import('@src/exampleViews/pages/authentication/ResetPasswordCover')
)

const VerifyEmailBasic = lazy(() =>
  import('@src/exampleViews/pages/authentication/VerifyEmailBasic')
)
const VerifyEmailCover = lazy(() =>
  import('@src/exampleViews/pages/authentication/VerifyEmailCover')
)

const TwoStepsBasic = lazy(() => import('@src/exampleViews/pages/authentication/TwoStepsBasic'))
const TwoStepsCover = lazy(() => import('@src/exampleViews/pages/authentication/TwoStepsCover'))

const AuthenticationRoutes = [
  {
    path: '/example/login',
    element: <Login />,
    meta: {
      layout: 'blank',
      publicRoute: true,
      restricted: true
    }
  },
  {
    path: '/example/pages/login-basic',
    element: <LoginBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/login-cover',
    element: <LoginCover />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/example/register',
    element: <Register />,
    meta: {
      layout: 'blank',
      publicRoute: true,
      restricted: true
    }
  },
  {
    path: '/pages/register-basic',
    element: <RegisterBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/register-cover',
    element: <RegisterCover />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/register-multi-steps',
    element: <RegisterMultiSteps />,
    meta: {
      layout: 'blank'
    }
  },

  {
    path: '/example/forgot-password',
    element: <ForgotPassword />,
    layout: 'BlankLayout',
    meta: {
      layout: 'blank',
      publicRoute: true,
      restricted: true
    }
  },
  {
    path: '/pages/forgot-password-basic',
    element: <ForgotPasswordBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/forgot-password-cover',
    element: <ForgotPasswordCover />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/reset-password-basic',
    element: <ResetPasswordBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/reset-password-cover',
    element: <ResetPasswordCover />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/verify-email-basic',
    element: <VerifyEmailBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/verify-email-cover',
    element: <VerifyEmailCover />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/two-steps-basic',
    element: <TwoStepsBasic />,
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/pages/two-steps-cover',
    element: <TwoStepsCover />,
    meta: {
      layout: 'blank'
    }
  }
]

export default AuthenticationRoutes

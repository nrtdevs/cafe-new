import { lazy } from 'react'

const Wizard = lazy(() => import('@src/exampleViews/forms/wizard'))
const Validation = lazy(() => import('@src/exampleViews/forms/validation'))
const FormLayouts = lazy(() => import('@src/exampleViews/forms/form-layouts'))
const Radio = lazy(() => import('@src/exampleViews/forms/form-elements/radio'))
const Input = lazy(() => import('@src/exampleViews/forms/form-elements/input'))
const FormRepeater = lazy(() => import('@src/exampleViews/forms/form-repeater'))
const Switch = lazy(() => import('@src/exampleViews/forms/form-elements/switch'))
const Editor = lazy(() => import('@src/exampleViews/forms/form-elements/editor'))
const Select = lazy(() => import('@src/exampleViews/forms/form-elements/select'))
const Textarea = lazy(() => import('@src/exampleViews/forms/form-elements/textarea'))
const InputMask = lazy(() => import('@src/exampleViews/forms/form-elements/input-mask'))
const Checkboxes = lazy(() => import('@src/exampleViews/forms/form-elements/checkboxes'))
const Datepickers = lazy(() => import('@src/exampleViews/forms/form-elements/datepicker'))
const InputGroups = lazy(() => import('@src/exampleViews/forms/form-elements/input-groups'))
const NumberInput = lazy(() => import('@src/exampleViews/forms/form-elements/number-input'))
const FileUploader = lazy(() => import('@src/exampleViews/forms/form-elements/file-uploader'))

const FormRoutes = [
  {
    element: <Input />,
    path: '/forms/elements/input'
  },
  {
    element: <InputGroups />,
    path: '/forms/elements/input-group'
  },
  {
    element: <InputMask />,
    path: '/forms/elements/input-mask'
  },
  {
    element: <Textarea />,
    path: '/forms/elements/textarea'
  },
  {
    element: <Checkboxes />,
    path: '/forms/elements/checkbox'
  },
  {
    element: <Radio />,
    path: '/forms/elements/radio'
  },
  {
    element: <Switch />,
    path: '/forms/elements/switch'
  },
  {
    element: <Select />,
    path: '/forms/elements/select'
  },
  {
    element: <NumberInput />,
    path: '/forms/elements/number-input'
  },
  {
    element: <FileUploader />,
    path: '/forms/elements/file-uploader'
  },
  {
    element: <Editor />,
    path: '/forms/elements/editor'
  },
  {
    element: <Datepickers />,
    path: '/forms/elements/pickers'
  },
  {
    element: <FormLayouts />,
    path: '/forms/layout/form-layout'
  },
  {
    element: <Wizard />,
    path: '/forms/wizard'
  },
  {
    element: <Validation />,
    path: '/forms/form-validation'
  },
  {
    element: <FormRepeater />,
    path: '/forms/form-repeater'
  }
]

export default FormRoutes

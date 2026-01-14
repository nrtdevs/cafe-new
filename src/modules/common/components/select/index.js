import classNames from 'classnames'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import SelectReact, { components } from 'react-select'
import { AsyncPaginate } from 'react-select-async-paginate'
import { FM, isValid, log } from '@src/utility/Utils'
import Show from '@src/utility/Show'
import { getSelectValues, getUniqId, makeSelectValues, selectThemeColors } from '@src/utility/Utils'

const Select = ({
  grouped = false,
  onChangeValue = () => {},
  matchWith = null,
  error = null,
  control,
  value,
  name,
  rules,
  isMulti,
  errors,
  options,
  async = false,
  isClearable = false,
  optionComponent = null,
  loadOptions = () => {},
  ...rest
}) => {
  const [v, setV] = useState(null)
  const [key, setKey] = useState(getUniqId('select-input'))
  const { Option } = components
  const IconOption = (props) => (
    <Option {...props}>
      <Show IF={isValid(props?.data?.icon)}>
        <props.data.icon className='text-primary' size={14} style={{ marginTop: -3 }} />{' '}
      </Show>
      {props.data.label}
    </Option>
  )
  if (async) {
    return (
      <>
        <Controller
          // key={`control-select-${key}-${options?.length}`}
          control={control}
          defaultValue={value}
          name={name}
          rules={rules}
          render={({ field: { onChange, ref } }) => (
            <AsyncPaginate
              // key={`select-${key}-${options?.length}`}
              placeholder={FM('select')}
              name={name}
              // ref={ref}
              selectRef={ref}
              isMulti={isMulti}
              components={{ Option: IconOption }}
              theme={selectThemeColors}
              className={classNames('react-select', { 'is-invalid': error ?? errors[name] })}
              classNamePrefix='select'
              isClearable={isClearable}
              loadOptions={loadOptions}
              value={
                v
                  ? makeSelectValues(options, v, isMulti, matchWith, grouped)
                  : makeSelectValues(options, value, isMulti, matchWith, grouped)
              }
              onChange={(val) => {
                if (isMulti) {
                  onChange(getSelectValues(val, matchWith))
                  setV(getSelectValues(val, matchWith))
                  onChangeValue(getSelectValues(val, matchWith))
                } else {
                  if (matchWith) {
                    onChange(val?.value[matchWith])
                    setV(val?.value[matchWith])
                    onChangeValue(val?.value[matchWith])
                  } else {
                    onChange(val?.value)
                    setV(val?.value)
                    onChangeValue(val?.value)
                  }
                }
              }}
              additional={{
                page: 1
              }}
              {...rest}
            />
          )}
        />
      </>
    )
  } else {
    return (
      <>
        <Controller
          key={`control-select-${key}-${options?.length}`}
          control={control}
          defaultValue={value}
          name={name}
          rules={rules}
          render={({ field: { onChange, ref } }) => (
            <SelectReact
              key={`select-${key}-${options?.length}`}
              ref={ref}
              isMulti={isMulti}
              placeholder={FM('select')}
              name={name}
              components={{ Option: IconOption }}
              theme={selectThemeColors}
              className={classNames('react-select', { 'is-invalid': error ?? errors[name] })}
              classNamePrefix='select'
              isClearable={isClearable}
              options={options}
              onMenuScrollToBottom={() => {
                log('test')
              }}
              value={
                v
                  ? makeSelectValues(options, v, isMulti, matchWith, grouped)
                  : makeSelectValues(options, value, isMulti, matchWith, grouped)
              }
              onChange={(val) => {
                // log("val", val)
                // if (isMulti) {
                //     onChange(getSelectValues(val))
                //     setV(getSelectValues(val))
                //     onChangeValue(getSelectValues(val))

                // } else {
                //     onChange(val?.value)
                //     setV(val?.value)
                //     onChangeValue(val?.value)

                // }
                if (isMulti) {
                  onChange(getSelectValues(val, matchWith))
                  setV(getSelectValues(val, matchWith))
                  onChangeValue(getSelectValues(val, matchWith))
                } else {
                  if (matchWith) {
                    onChange(val?.value[matchWith])
                    setV(val?.value[matchWith])
                    onChangeValue(val?.value[matchWith])
                  } else {
                    onChange(val?.value)
                    setV(val?.value)
                    onChangeValue(val?.value)
                  }
                }
              }}
              {...rest}
            />
          )}
        />
      </>
    )
  }
}

export default Select

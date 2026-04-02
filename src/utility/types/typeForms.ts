import { FMKeys } from '@src/configs/i18n/FMTypes'
import { AxiosResponse } from 'axios'
import flatpickr from 'flatpickr'
import { ReactElement } from 'react'
import { DropzoneOptions } from 'react-dropzone'
import { RegisterOptions } from 'react-hook-form'
import { GroupBase, Options, OptionsOrGroups } from 'react-select'
import type { ComponentProps, UseAsyncPaginateParams } from 'react-select-async-paginate'
import type { CreatableProps } from 'react-select/creatable'
import { InputType } from 'reactstrap/types/lib/Input'
import { DropdownProps } from './typeDropdown'

export declare type Checked = 0 | 1
export interface Option {
  label: string | any
  value: number | string | unknown
  extra?: any
}
export interface AsyncOptionProps {
  page: number
  options: OptionsOrGroups<Option, GroupBase<Option>>
  hasMore: boolean
}
export interface DropZoneOptions extends DropzoneOptions {
  excludeFiles?: any[]
}
export interface FormGroupCustomProps {
  noGroup?: boolean
  noLabel?: boolean
  dropZoneOptions?: DropZoneOptions
  isMulti?: boolean
  isClearable?: boolean
  isDisabled?: boolean
  async?: boolean
  accept?: any
  method?: string
  type: InputType | 'mask' | 'editor' | 'dropZone'
  defaultOptions?: boolean
  name: string
  placeholder?: string
  label?: any
  prepend?: any
  append?: any
  tooltip?: string
  message?: any
  maskOptions?: any
  errorMessage?: any
  className?: any
  pattern?: any
  control: any
  checked?: Checked | boolean
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
  defaultValue?: any
  datePickerOptions?: flatpickr.Options.Options
  dateFormat?: string
  inputClassName?: any
  inputGroupClassName?: any
  selectOptions?: OptionsOrGroups<Option, GroupBase<Option>>
  //selectOptions?: any[]
  path?: string
  selectValue?: (e: any) => any
  autoFocus?: any
  selectLabel?: (e: any) => string
  modifySelectData?: (e: any) => any
  jsonData?: any
  searchItem?: any
  feedback?: any
  step?: any
  min?: any
  max?: any
  creatable?: boolean
  onChangeValue?: (e: any) => void
  createLabel?: FMKeys
  loadOptions?: (e: DropdownProps) => Promise<void | AxiosResponse<any, any>>
  isOptionDisabled?: (option: Option, selectValue: Options<Option>) => boolean
}

export type AsyncPaginateCreatableProps<
  OptionType,
  Group extends GroupBase<OptionType>,
  Additional,
  IsMulti extends boolean
> = CreatableProps<OptionType, IsMulti, Group> &
  UseAsyncPaginateParams<OptionType, Group, Additional> &
  ComponentProps<OptionType, Group, IsMulti>

export type AsyncPaginateCreatableType = <
  OptionType,
  Group extends GroupBase<OptionType>,
  Additional,
  IsMulti extends boolean = false
>(
  props: AsyncPaginateCreatableProps<OptionType, Group, Additional, IsMulti>
) => ReactElement

import Show from '@src/utility/Show'
import {
    FM,
    createSelectOptions,
    formatDate,
    getUniqId,
    isValid,
    isValidArray,
    log,
    selectThemeColors
} from '@src/utility/Utils'
import { useSkin } from '@src/utility/hooks/useSkin'
import http from '@src/utility/http/useHttp'
import {
    AsyncPaginateCreatableType,
    FormGroupCustomProps,
    Option
} from '@src/utility/types/typeForms'
import '@styles/react/libs/editor/editor.scss'
import classNames from 'classnames'
import Cleave from 'cleave.js/react'
import { ContentState, EditorState, convertFromHTML, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { english } from 'flatpickr/dist/l10n/default'
import { Swedish } from 'flatpickr/dist/l10n/sv'
import { useEffect, useId, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { HelpCircle } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import { useController } from 'react-hook-form'
import SelectReact, { GroupBase, OptionsOrGroups } from 'react-select'
import { AsyncPaginate, withAsyncPaginate } from 'react-select-async-paginate'
import CreatableSelect from 'react-select/creatable'
import { FormFeedback, FormText, Input, InputGroup, Label } from 'reactstrap'
import DropZone from '../fileUploader'
import InputPasswordToggle from '../input-password-toggle'
import BsTooltip from '../tooltip'

const CreatableAsyncPaginate = withAsyncPaginate(CreatableSelect) as AsyncPaginateCreatableType

const FormGroupCustom = (props: FormGroupCustomProps) => {
    // Input Props
    const {
        name,
        control,
        isMulti = false,
        isClearable = false,
        isDisabled = false,
        rules,
        method,
        defaultValue,
        type,
        placeholder,
        checked,
        datePickerOptions,
        dateFormat,
        noGroup = false,
        noLabel = false,
        label,
        async = false,
        selectOptions,
        className,
        inputClassName,
        inputGroupClassName,
        loadOptions,
        accept,
        defaultOptions,
        message,
        tooltip,
        prepend,
        append,
        pattern,
        autoFocus = false,
        errorMessage = null,
        path = null,
        selectValue = () => '',
        selectLabel = () => '',
        jsonData = null,
        searchItem = 'name',
        onChangeValue = () => { },
        maskOptions,
        step,
        creatable = false,
        modifySelectData = (data: any) => data,
        createLabel = 'create',
        dropZoneOptions
    } = props

    const id = useId()
    const [key, setId] = useState(getUniqId('input-field'))
    // Skin
    const { skin } = useSkin()
    // editor value
    const [editorValue, setEditorValue] = useState<any>(null)

    // React Hook Form Controller
    const {
        field: { onChange, onBlur, value, ref },
        fieldState: { error }
    } = useController({
        name,
        control,
        rules: {
            ...rules,
            validate:
                typeof rules?.validate === 'function'
                    ? rules?.validate
                    : (val: string) => {
                        return type !== 'dropZone'
                            ? type !== 'select'
                                ? isValid(val)
                                    ? String(val)?.replace(/\s/g, '')?.length > 0
                                    : true
                                : true
                            : true
                    }
            // validate: (v) => {
            //   return isValid(v) ? !SpaceTrim(v) : true
            // }
        },
        defaultValue
    })
    // log('val', name, value, defaultValue)
    // Renderer
    let render: JSX.Element = <></>

    async function loadOptionsAsync(search: string, loadedOptions: any, additional: any) {
        const page = additional?.page ?? 1
        let options: OptionsOrGroups<Option, GroupBase<Option>> = []
        let hasMore = false
        if (typeof loadOptions === 'function' && isValid(path)) {
            const res = await loadOptions({
                async: async || creatable,
                path,
                method,
                jsonData: { ...jsonData, [searchItem]: search },
                page,
                perPage: 50
            })
            const response = res?.data?.payload
            if (String(res?.request?.responseURL)?.includes('/unauthorized')) {
                http.isUnauthenticated({ code: 401 })
            }

            let results: any = {}
            if (response?.data?.length > 0) {
                results = {
                    ...response,
                    data: createSelectOptions(modifySelectData(response?.data), selectLabel, selectValue)
                }
                options = results?.data ?? []
                hasMore = parseInt(results?.last_page) !== parseInt(results?.current_page)
                additional = {
                    page: page + 1
                }
            }
        }
        return {
            options,
            hasMore,
            additional
        }
    }

    useEffect(() => {
        if (type === 'editor') {
            const a = convertFromHTML(defaultValue ? defaultValue : '<p></p>')
            setEditorValue(
                EditorState.createWithContent(
                    ContentState.createFromBlockArray(a.contentBlocks, a.entityMap)
                )
            )
        }
    }, [defaultValue, type])

    // Switch types
    switch (type) {
        case 'date':
            render = (
                <>
                    <Flatpickr
                        className={classNames(`form-control flatpickr-input ${inputClassName}`, {
                            'bg-white': skin !== 'dark',
                            'is-invalid': isValid(error)
                        })}
                        options={{
                            locale: english ?? Swedish, // TODO: change by languages
                            time_24hr: false,
                            isDisabled: false,
                            altFormat: 'j M Y',
                            altInput: true,
                            ...datePickerOptions
                        }}

                        value={value ?? defaultValue ?? null}

                        placeholder={placeholder ?? label ?? name}
                        name={name}
                        onChange={(e, v, s) => {
                            if (datePickerOptions?.mode === 'multiple' || datePickerOptions?.mode === 'range') {
                                if (dateFormat) {
                                    onChange(e?.map((data: any) => formatDate(data, dateFormat)))
                                } else {
                                    onChange(e)
                                }
                            } else {
                                if (dateFormat) {
                                    onChange(formatDate(v, dateFormat))
                                } else {
                                    onChange(v)
                                }
                            }
                        }}
                        // ref={ref}
                        // ref={ref}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
        case 'datetime':
            render = (
                <>
                    <Flatpickr
                        className={classNames(`form-control flatpickr-input ${inputClassName}`, {
                            'bg-white': skin !== 'dark',
                            'is-invalid': isValid(error)
                        })}
                        options={{
                            locale: english ?? Swedish,
                            time_24hr: false,
                            altFormat: 'j M Y H:i',
                            altInput: true,
                            ...datePickerOptions,
                            enableTime: true,
                            // minTime: "01:00",
                            // maxTime: "24:00",

                        }}

                        value={value ?? defaultValue ?? null}

                        placeholder={placeholder ?? label ?? name}
                        name={name}
                        onChange={(e, v, s) => {
                            if (datePickerOptions?.mode === 'multiple' || datePickerOptions?.mode === 'range') {
                                if (dateFormat) {
                                    onChange(e?.map((data: any) => formatDate(data, dateFormat)))
                                } else {
                                    onChange(e)

                                }
                            } else {
                                if (dateFormat) {
                                    onChange(formatDate(v, dateFormat))
                                } else {
                                    onChange(v)
                                }
                            }
                        }}
                        // ref={ref}
                        // ref={ref}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
        case 'time':
            render = (
                <>
                    <Flatpickr
                        className={classNames(`form-control flatpickr-input ${inputClassName}`, {
                            'bg-white': skin !== 'dark',
                            'is-invalid': isValid(error)
                        })}
                        options={{
                            locale: english ?? Swedish, // TODO: change by languages
                            time_24hr: false,
                            noCalendar: true,
                            enableTime: true,
                            altFormat: 'h:i K',
                            altInput: true,
                            ...datePickerOptions
                        }}
                        isDisabled={isDisabled}
                        value={value ?? defaultValue ?? null}
                        placeholder={placeholder ?? label ?? name}
                        name={name}
                        onChange={(e, v, s) => {
                            if (dateFormat) {
                                onChange(formatDate(v, dateFormat))
                            } else {
                                onChange(v)
                            }
                        }}
                        ref={ref}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break

        case 'select':
            if (async) {
                render = (
                    <>
                        <div className='flex-1'>
                            <AsyncPaginate
                                loadOptions={loadOptionsAsync}
                                value={value ?? defaultValue ?? null}
                                // options={selectOptions}
                                isClearable={isClearable}
                                isMulti={isMulti}
                                name={name}
                                isDisabled={isDisabled}
                                theme={selectThemeColors}
                                selectRef={ref}
                                onMenuScrollToBottom={() => {
                                    //  log('touched')
                                }}
                                defaultOptions={defaultOptions}
                                className={classNames(`react-select ${inputClassName}`, {
                                    'is-invalid': isValid(error)
                                })}
                                isOptionDisabled={props?.isOptionDisabled}
                                placeholder={placeholder ?? label ?? name}
                                classNamePrefix='select'
                                onChange={(val) => {
                                    onChange(val)
                                    onChangeValue(val)
                                }}
                                additional={{
                                    page: 1
                                }}
                                id={`input-${id}-tooltip`}
                            />
                        </div>
                    </>
                )
            } else if (creatable) {
                render = (
                    <>
                        <div className='flex-1'>
                            <CreatableAsyncPaginate
                                loadOptions={loadOptionsAsync}
                                value={value ?? defaultValue ?? null}
                                // options={selectOptions}
                                isClearable={isClearable}
                                isMulti={isMulti}
                                name={name}
                                isDisabled={isDisabled}
                                theme={selectThemeColors}
                                selectRef={ref}
                                onMenuScrollToBottom={() => {
                                    //  log('touched')
                                }}
                                defaultOptions={defaultOptions}
                                className={classNames(`react-select ${inputClassName}`, {
                                    'is-invalid': isValid(error)
                                })}
                                formatCreateLabel={(userInput) => `${FM(createLabel)} ${userInput}`}
                                isOptionDisabled={props?.isOptionDisabled}
                                placeholder={placeholder ?? label ?? name}
                                classNamePrefix='select'
                                onChange={(val) => {
                                    onChange(val)
                                    onChangeValue(val)
                                }}
                                additional={{
                                    page: 1
                                }}
                                id={`input-${id}-tooltip`}
                            />
                        </div>
                    </>
                )
            } else {
                render = (
                    <>
                        <div className='flex-1'>
                            <SelectReact
                                ref={ref}
                                value={value ?? defaultValue ?? null}
                                options={selectOptions}
                                isClearable={isClearable}
                                isDisabled={isDisabled}
                                isMulti={isMulti}
                                name={name}
                                theme={selectThemeColors}
                                className={classNames(`react-select ${inputClassName}`, {
                                    'is-invalid': isValid(error)
                                })}
                                placeholder={placeholder ?? label ?? name}
                                classNamePrefix='select'
                                onChange={(val) => {
                                    onChange(val)
                                    onChangeValue(val)
                                }}
                                id={`input-${id}-tooltip`}
                            />
                        </div>
                    </>
                )
            }
            break
        case 'checkbox':
            render = (
                <>
                    <Input
                        checked={value === 1 || defaultValue === 1}
                        placeholder={placeholder ?? label ?? name}
                        name={name}
                        onChange={(e) => {
                            onChange(e?.target?.checked ? 1 : 0)
                            onChangeValue(e)

                        }
                        }
                        className={`${inputClassName}`}
                        innerRef={ref}
                        invalid={isValid(error)}
                        type={type}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
        case 'radio':
            render = (
                <>
                    <Input
                        value={defaultValue}
                        checked={defaultValue === value}
                        placeholder={placeholder ?? label ?? name}
                        name={name}
                        onChange={(e) => onChange(e?.target?.value)}
                        className={` ${inputClassName}`}
                        innerRef={ref}
                        invalid={isValid(error)}
                        type={type}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
        case 'mask':
            render = (
                <>
                    <Cleave
                        value={value ?? defaultValue ?? null}
                        placeholder={placeholder ?? label ?? name}
                        disabled={isDisabled}
                        name={name}
                        onChange={(e) => onChange(e?.target?.value)}
                        onBlur={(e) => onChange(e?.target?.value)}
                        className={`form-control ${inputClassName} ${error ? 'is-invalid' : ''}`}
                        htmlRef={ref}
                        options={maskOptions}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
        case 'editor':
            render = (
                <Editor
                    toolbar={{
                        options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'remove', 'history'],
                        inline: {
                            options: ['bold', 'italic', 'underline', 'strikethrough']
                        }
                    }}
                    wrapperClassName={isValid(error) ? 'invalid' : ''}
                    editorState={editorValue}
                    onEditorStateChange={(data: any) => {
                        setEditorValue(data)
                        // onChangeValue(draftToHtml(convertToRaw(data?.getCurrentContent())))
                        onChange(draftToHtml(convertToRaw(data?.getCurrentContent())))
                    }}
                />
            )
            break
        case 'password':
            render = (
                <InputPasswordToggle
                    value={value ?? defaultValue ?? null}
                    placeholder={placeholder ?? label ?? name}
                    disabled={isDisabled}
                    name={name}
                    autoFocus={autoFocus}
                    onChange={(e) => onChange(e?.target?.value)}
                    onBlur={(e) => onChange(e?.target?.value)}
                    className={`form-control input-group-merge ${inputClassName}`}
                    innerRef={ref}
                    invalid={isValid(error)}
                    //   type={type}
                    id={`input-${id}-tooltip`}
                />
            )
            break
        case 'dropZone':
            render = (
                <div className='flex-1'>
                    <DropZone
                        dropZoneOptions={dropZoneOptions}
                        defaultValue={value ?? defaultValue ?? undefined}
                        onChange={(e) => {
                            onChange(e)
                        }}
                    />
                </div>
            )
            break
        case 'file':
            render = (
                <>
                    <Input
                        // value={value ?? defaultValue ?? null}
                        placeholder={placeholder ?? label ?? name}
                        disabled={isDisabled}
                        name={name}
                        accept={accept}
                        autoFocus={autoFocus}
                        onChange={(e) => {
                            if (isValidArray(e?.target?.files)) {
                                log(e?.target?.files)
                                onChange(e?.target?.files)
                            }
                        }}
                        onBlur={(e) => {
                            if (isValidArray(e?.target?.files)) {
                                onChange(e?.target?.files)
                            }
                        }}
                        className={`form-control ${inputClassName}`}
                        innerRef={ref}
                        invalid={isValid(error)}
                        type={type}
                        step={step}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break

        default:
            render = (
                <>
                    <Input
                        value={value ?? defaultValue ?? null}
                        placeholder={placeholder ?? label ?? name}
                        disabled={isDisabled}
                        name={name}
                        autoFocus={autoFocus}
                        onChange={(e) => {
                            onChange(e?.target?.value)
                            onChangeValue(e)
                        }
                        }
                        onBlur={(e) => onChange(e?.target?.value)}
                        className={`form-control ${inputClassName}`}
                        innerRef={ref}
                        invalid={isValid(error)}
                        pattern={type === 'email' ? pattern : null}
                        type={type}
                        step={step}
                        id={`input-${id}-tooltip`}
                    />
                </>
            )
            break
    }
    const renderDefaultMessages = () => {
        let re: any = null
        switch (error?.type) {
            case 'required':
                re = FM('this-field-is-required')
                break
            case 'min':
                re = rules?.min ? FM('please-insert-min-value', { minValue: rules?.min }) : error?.message
                break
            case 'max':
                re = rules?.max ? FM('input-reached-max-value', { maxValue: rules?.max }) : error?.message
                break
            case 'validate':
                re = `${FM('invalid-input-data')} ${errorMessage ? `: ${errorMessage}` : ''} ${error?.message ? `: ${error?.message}` : ''
                    }`
                break
            case 'pattern':
                re = rules?.pattern
                    ? `${FM('invalid-input-data')}${errorMessage ? `: ${errorMessage}` : ''}`
                    : error?.message
                break
            case 'maxLength':
                re = FM('input-max-length-reached', { maxLength: rules?.maxLength })
                break
            case 'minLength':
                re = FM('input-min-length-required', { minLength: rules?.minLength })
                break
            default:
                re = errorMessage ?? error?.message ?? ''
                break
        }
        return re
    }
    const renderMessages = (
        <>
            <FormFeedback className={classNames({ 'd-block': isValid(error) })}>
                {renderDefaultMessages()}
            </FormFeedback>
            <Show IF={isValid(message)}>
                <FormText className='fw-bolder'>{message}</FormText>
            </Show>
        </>
    )
    const labelLocal = noLabel ? null : (
        <>
            <Label check={type === 'checkbox'} for={`input-${id}-tooltip`}>
                {label ?? name} {rules?.required ? <span className='text-danger fw-bolder'>*</span> : null}{' '}
                <Show IF={isValid(tooltip)}>
                    <BsTooltip title={tooltip}>
                        <HelpCircle style={{ marginTop: '-2px' }} size={13} className='text-dark' />
                    </BsTooltip>
                </Show>
            </Label>
        </>
    )

    const grouped =
        type === 'checkbox' || type === 'radio' ? (
            <>
                <div className={`form-check ${className}`}>
                    {render} {labelLocal}
                    {!noLabel ? renderMessages : ''}
                </div>
            </>
        ) : (
            <>
                <div className={className}>
                    {labelLocal}
                    <InputGroup className={inputGroupClassName}>
                        {prepend ?? null}
                        {render}
                        {append ?? null}
                    </InputGroup>
                    {!noLabel ? renderMessages : ''}
                </div>
            </>
        )

    const direct = (
        <>
            {labelLocal}
            {render}
            <p className='mb-0'> {!noLabel ? renderMessages : ''}</p>
        </>
    )

    if (noGroup) {
        return <div className={className}>{direct}</div>
    } else {
        return grouped
    }
}

export default FormGroupCustom

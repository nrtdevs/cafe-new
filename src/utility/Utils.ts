// import CryptoJS from 'crypto-js'
import i18n from '@src/configs/i18n'
import { FMKeys } from '@src/configs/i18n/FMTypes'
import moment from 'moment'
import toast from 'react-hot-toast'
import { GroupBase, OptionsOrGroups } from 'react-select'
// import { FMKeys } from '../configs/i18n/FMTypes'
import { DefaultRoute } from '../router/routes/index'
import { Events } from './Const'
import Emitter from './Emitter'
import httpConfig from './http/httpConfig'
import { Option } from './types/typeForms'

export const isDebug = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
let ddebug = function (...e: any) { }

if (isDebug) {
    ddebug = console.log.bind(window.console)
}
export const log = ddebug

export const isValid = (val: any, extra: any = null) => {
    let r = true
    if (val === null) {
        r = false
    } else if (val === undefined) {
        r = false
    } else if (val === '') {
        r = false
    } else if (val === extra) {
        r = false
    } else if (val === 'null') {
        r = false
    }
    return r
}

export const debounce = (func: any, delay: any) => {
    let timeoutId
    return function (...args: any) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            // @ts-ignore
            func.apply(this, args)
        }, delay)
    }
}

export const isValidArray = (val: any) => {
    if (isValid(val)) {
        if (typeof val === 'object') {
            return val?.length > 0
        }
    }
    return false
}

/**
 * Translate
 * @param {*} id
 * @param {*} values
 * @param {*} create
 * @returns
 */


const capitalize = (str: string, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase())

export const getInitials = (name: string) => {
    name = capitalize(name)
    const rgx = /(\p{L}{1})\p{L}+/gu
    const a: IterableIterator<RegExpMatchArray> = name.matchAll(rgx)
    let initials: any = [...a]

    initials = ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase()
    return initials
}
export const getInitials2 = (str: string) => {
    const results: string[] = []
    if (isValid(str)) {
        const wordArray: string[] = str.split(' ')
        wordArray.forEach((e: string) => {
            results.push(e[0])
        })
        return results.join('').toUpperCase()
    } else {
        return ''
    }
}

/**
 * Create Ability
 */
export const createAbility = (permissions = []) => {
    let abilities = [
        {
            subject: 'profile',
            action: 'profile-browse'
        },
        {
            subject: 'profile',
            action: 'profile-edit'
        }
    ]
    if (isValid(permissions)) {
        abilities = [...abilities, ...permissions]
    }
    // log(permissions, abilities)
    return abilities
}

export const FM = (id: FMKeys, values?: any) => {
    if (values === null) values = {}
    return String(i18n.t(id, { ...values }))
}
export const emailValidation =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const dispattern = '[0-9]+([,|.][0-9]+)?'
// export const FM = (id, values) => {
//     return id
// }

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = (obj) => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = (num) => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, '')

// ** Checks if the passed date is today
const isToday = (date) => {
    const today = new Date()
    return (
        /* eslint-disable operator-linebreak */
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
        /* eslint-enable */
    )
}

export const formatDate = (value: any, format = 'DD MMM YYYY', res: any = '') => {
    const d = moment(value).format(format)
    if (d !== 'Invalid date') {
        return d
    } else {
        return res
    }
}

export const formatDateValue = (value: any, format = 'DD-MM-YYYY HH:mm:ss', res: any = '') => {
    // Parse the date using the known format and convert to desired format
    const d = moment(value, 'YYYY-MM-DD HH:mm').format(format)

    if (d !== 'Invalid date') {
        return d
    } else {
        return res
    }
}

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
    const date = new Date(value)
    let formatting: any = { month: 'short', day: 'numeric' }

    if (toTimeForCurrentDay && isToday(date)) {
        formatting = { hour: 'numeric', minute: 'numeric' }
    }

    return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem(httpConfig.storageUserData)
export const getUserData = () =>
    JsonParseValidate(localStorage.getItem(httpConfig.storageUserData) as any)

/** @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = (userRole) => {
    if (userRole === 'admin') return DefaultRoute
    if (userRole === 'client') return '/access-control'
    return '/login'
}

// ** React Select Theme Colors
export const selectThemeColors = (theme) => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary25: '#00338d', // for option hover bg-color
        primary: '#00338d', // for selected option bg-color
        neutral10: '#00338d', // for tags bg-color
        neutral20: '#ededed', // for input border-color
        neutral30: '#ededed' // for input hover border-color
    }
})

export function getDescendantProp(obj: any, desc: any) {
    const arr = desc.split('.')
    while (arr.length && (obj = obj[arr.shift()]));
    return obj
}

// import { toast } from "react-toastify"
export const IsJsonString = (str: string) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}
export const JsonParseValidate = (data: any) => {
    if (data && IsJsonString(data)) {
        const json = JSON.parse(data)
        if (typeof json === 'object') {
            return json
        } else {
            return null
        }
    } else {
        return null
    }
}

export const emitAlertStatus = (
    e: 'success' | 'failed',
    payload: any | null = null,
    event: any = Events.confirmAlert
) => {
    log('event called', event, e)
    Emitter.emit(event, { type: e, payload: isValid(payload) ? payload : null })
}

let id = 0
export const getUniqId = (prefix: string) => {
    id++
    return `${prefix}-${id}`
}

export const ErrorToast = (message: any, settings = {}, comp: any | null = null) => {
    toast.error(comp ?? message, settings)
}

export const SuccessToast = (message: any, settings = {}, comp: any | null = null) => {
    toast.success(comp ?? message, settings)
}

export const getSelectValues = (val: any[] = [], matchWith: any | null = null) => {
    if (matchWith) {
        return val?.map((a) => a.value[matchWith])
    } else return val?.map((a) => a.value)
}

export const matchValue = (value: any, selected: any, matchWith: any) => {
    if (typeof value === 'object') {
        return String(value[matchWith]) === String(selected)
    } else {
        return String(value) === String(selected)
    }
}

export const makeSelectValues = (
    option: any[] = [],
    value: any[] = [],
    multi = false,
    matchWith: any | null = null,
    grouped = false,
    setOption = null
) => {
    try {
        let re: any[] = []
        if (!multi) {
            re = isValidArray(option) ? option?.find((c) => matchValue(c?.value, value, matchWith)) : []
            // log('matchWith', matchWith)
            // log(option, value)
        } else {
            if (value?.length > 0) {
                value?.forEach((v, i) => {
                    let x: any[] = []
                    if (grouped) {
                        option?.forEach((q) => {
                            if (isValid(q?.options?.find((a: any) => matchValue(a?.value, v, matchWith)))) {
                                x = q?.options?.find((a: any) => matchValue(a?.value, v, matchWith))
                            }
                        })
                    } else {
                        x = option?.find((a) => matchValue(a?.value, v, matchWith))
                    }
                    // log("x", x)
                    // log("option", option)
                    if (x) re.push(x)
                })
            }
        }

        return re
    } catch (error) {
        //  log('makeSelectValues', error)
        // log(option, value)
        // log(matchWith, multi)
    }
}

export const createConstSelectOptions = (
    object: any,
    FM = (e: any) => { },
    hide = (e: any) => {
        return false
    }
): OptionsOrGroups<Option, GroupBase<Option>> => {
    const data: any = []
    for (const [key, value] of Object.entries(object)) {
        if (!hide(value)) {
            data.push({
                label: FM(key),
                value
            })
        }
    }
    return data
}
export const createSelectOptions = (
    array: any[],
    label: (e: any) => string,
    value: (e: any) => any,
    icon = (e: any) => { }
) => {
    const data: any[] = []
    array?.forEach((option) => {
        data.push({
            label: label(option),
            value: value(option),
            extra: option,
            icon: icon(option)
        })
    })
    return data
}

export const toggleArray = (
    value?: any,
    array?: Array<any>,
    state = (e: any) => { },
    match = (e: any) => {
        return e === value
    }
) => {
    const index: any = array?.findIndex((e) => match(e))
    const finalArray: any = array
    if (index === -1) {
        finalArray?.push(value)
    } else {
        finalArray?.splice(index, 1)
    }
    state([...finalArray])
}

export const createAsyncSelectOptions = (
    res: any,
    page: any,
    label: any,
    value: any,
    setOptions = (e: any) => { },
    icon = (e: any) => { }
) => {
    const response = res?.data?.payload
    let results: any = {}
    if (response?.data?.length > 0) {
        results = {
            ...response,
            data: createSelectOptions(response?.data, label, value, icon)
        }
        setOptions(results?.data)

        return {
            options: results?.data ?? [],
            hasMore: parseInt(results?.last_page) !== parseInt(results?.current_page),
            additional: {
                page: page + 1
            }
        }
    } else {
        return {
            options: [],
            hasMore: false
        }
    }
}

export const humanFileSize = (bytes: any, si = false, dp = 1) => {
    const thresh = si ? 1000 : 1024
    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`
    }
    const units = si
        ? ['Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']
        : ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1
    const r = 10 ** dp
    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
    return `${bytes.toFixed(dp)} ${units[u]}`
}

export const getFIleBinaries = (files = {}) => {
    const re: any = {}
    for (const [key, val] of Object.entries(files)) {
        re[`file[${key}]`] = val
    }
    return re
}

export function fastLoop<T = any>(array: T[] | undefined | null, change = (e: T, i: number) => { }) {
    if (isValidArray(array)) {
        const theArray = array ?? []
        const arrayLength = theArray.length
        let x = 0
        while (x < arrayLength) {
            const arr = theArray[x]
            change(arr, x)
            x++
        }
    }
}

export function getRandomInRange(from: any, to: any, fixed: any) {
    // eslint-disable-next-line no-mixed-operators
    return (Math.random() * (to - from) + from).toFixed(fixed)
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}

export function fillObject<T = any>(formData: T | undefined, data: T) {
    const re: any = {}
    for (const key in formData) {
        type OnlyKeys = keyof typeof data
        const k = key as OnlyKeys
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            // if (k !== 'subscription_terms') {
            const value = data[k]
            re[k] = value
            // }
        }
    }
    return re as T
}

export function setValues<T = any>(
    formData: T | undefined,
    setValue = (name: any, value: any) => { }
) {
    for (const key in formData) {
        type OnlyKeys = keyof typeof formData
        const k = key as OnlyKeys
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
            // if (k !== 'subscription_terms') {
            const value = formData[k]
            //   log('key', k, value)
            setValue(k, value)
            // }
        }
    }
}
export const fromNow = (data: string) => {
    return moment(data).fromNow()
}
export const truncateText = (text: any, char = 10) => {
    if (isValid(text)) {
        return String(text).substring(0, char) + (String(text)?.length > char ? ' ' : '')
    } else {
        return null
    }
}
export const isFloat = (n: any = '') => {
    // return Number(n) === n && n % 1 !== 0;
    return String(n).includes('.')
}
/**
 * Currency Format
 * @param money
 * @param languageCode
 * @param countryCode
 * @param currency
 * @returns
 */
export const CF = ({
    money = 0,
    // languageCode = 'en',
    countryCode = 'us',
    currency = 'SEK'
}: {
    money: number | null
    languageCode?: string
    countryCode?: string
    currency: any
}) => {
    const la = localStorage.getItem('lang')
    const laa = JsonParseValidate(la)
    //   log('llaCurr', laa)
    if (money) {
        return new Intl.NumberFormat(
            `${laa?.value ?? 'en'}-${currency === 'SEK' ? 'se' : countryCode}`,
            {
                currency: isValid(currency) ? currency : 'SEK',
                style: 'currency',
                // minimumFractionDigits: isFloat(money) ? 2 : 0,
                maximumFractionDigits: isFloat(money) ? 2 : 0
            }
        ).format(money)
    } else {
        return 0
    }
}

export const amtFormat = (amount: any) => {
    if (isValid(amount)) {
        const amt = `${amount}`.replace(',', '.')
        return amt
    } else {
        return 0
    }
}

export const jsonDecodeAll = (fields: any, object: any, all = true) => {
    const re: any = {}
    for (const [key, value] of Object.entries(object)) {
        if (fields?.hasOwnProperty(key)) {
            if (fields[key] === 'json') {
                re[key] = JsonParseValidate(value)
            } else {
                re[key] = value
            }
        }
    }
    if (all) {
        return { ...object, ...re }
    } else {
        return re
    }
}

export function rand(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1 + min))
}

export const formatAndSetData = (address: any) => {
    let country = ''
    let city = ''
    let state = ''
    let full_address = ''
    let zip_code = ''
    if (address.address_components?.length > 0) {
        full_address = address.formatted_address
        address.address_components.map((obj: any) => {
            obj.types.map((string: any) => {
                if (string === 'country') country = obj.long_name
                else if (string === 'locality' || string === 'postal_town') city = obj.long_name
                else if (string === 'administrative_area_level_1') state = obj.long_name
                else if (string === 'postal_code') zip_code = obj.long_name
            })
        })
    }
    return {
        state,
        country,
        city,
        zip_code,
        full_address
    }
}
const CryptoJS: any = null
export const decrypt = (text: string) => {
    if (isValid(text) && httpConfig?.enableAES) {
        // Decrypt
        const bytes = CryptoJS.AES.decrypt(text, httpConfig.encryptKey)
        const originalText = bytes.toString(CryptoJS.enc.Utf8)
        return originalText
    } else {
        return text
    }
}
export const decryptObject = (
    fields: any,
    object: any,
    modify = (k: any, v: any) => {
        return v
    }
) => {
    const state: any = {}
    if (isValid(object)) {
        for (const [key, value] of Object.entries(object)) {
            if (fields?.hasOwnProperty(key)) {
                const x = modify(key, value)
                if (isValid(value)) {
                    try {
                        state[key] = isValid(decrypt(x)) ? decrypt(x) : x
                    } catch (error) {
                        log(error, key, value)
                    }
                } else {
                    state[key] = x
                }
            } else {
                const x = modify(key, value)
                state[key] = x
            }
        }
    }
    return {
        ...object,
        ...state
    }
}
export const isArray = (obj: any) => {
    return Array.isArray(obj)
}
export const decryptAnythingArray = (array: Array<any>) => {
    const state: Array<any> = []
    if (isValidArray(array)) {
        fastLoop(array, (x, i) => {
            log('array index', i)
            if (isArray(x)) {
                // array (recursive)
                state[i] = decryptAnythingArray(x)
            } else if (typeof x !== 'object') {
                // object
                if (isValid(x)) {
                    try {
                        log('array index', i, 'string', state[i])
                        state[i] = isValid(decrypt(x)) ? decrypt(x) : x
                    } catch (error) {
                        log(error, i, x)
                    }
                } else {
                    log('array index', i, 'n/a', state[i])

                    state[i] = x
                }
            } else {
                // object
                // eslint-disable-next-line no-use-before-define
                state[i] = decryptAnythingObject(x)
            }
        })
    }
    return state
}
export const decryptAnythingObject = (object: any) => {
    const state: any = {}
    if (isValid(object)) {
        for (const [key, value] of Object.entries(object)) {
            const x: any = value
            if (isArray(x)) {
                // array
                log(key, 'array', value)
                state[key] = decryptAnythingArray(x)
            } else if (typeof x !== 'object') {
                // object
                if (isValid(x)) {
                    try {
                        log(key, 'string', value)
                        state[key] = isValid(decrypt(x)) ? decrypt(x) : x
                    } catch (error) {
                        log(error, key, value)
                    }
                } else {
                    log(key, 'string', 'n/a', value)
                    state[key] = x
                }
            } else {
                // object (recursive)
                log(key, 'object', 'n/a', value)
                state[key] = decryptAnythingObject(x)
            }
        }
    }
    return {
        ...object,
        ...state
    }
}

export const decryptAnything = (data: Array<any> | any) => {
    log('working', data)
    //check if data is object or array
    if (isArray(data)) {
        const re: Array<any> = []
        // array
        log('array')
        fastLoop(data, (d, i) => {
            log('array index', i)
            re.push(decryptAnythingObject(data))
        })
        return re
    } else {
        let re: any = {}
        // object
        log('object')
        re = decryptAnythingObject(data)

        return re
    }
}

// const getProductPrice = (product: ProductParamType) => {
//     if(product?.discounted_price > )
// }
export function getKeyByValue(object: any, value: any): FMKeys {
    return Object.keys(object).find((key) => object[key] === value) as FMKeys
}
export const addDay = (d: any, day: number) => {
    const someDate = new Date(d)
    const numberOfDaysToAdd = day
    const result = someDate.setDate(someDate.getDate() + numberOfDaysToAdd)
    return result
}
export const minusDay = (d: any, day: number) => {
    const someDate = new Date(d)
    const numberOfDaysToAdd = day
    const result = someDate.setDate(someDate.getDate() - numberOfDaysToAdd)
    return result
}

export const checkHttp = (urlString: string) => {
    try {
        return Boolean(new URL(urlString))
    } catch (e) {
        return false
    }
}
export function getMonday(d: Date) {
    const day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
}
export function getWeekStartEnd(d: Date) {
    const firstDay = getMonday(d)
    const lastDay = new Date(addDay(firstDay, 6))

    return { firstDay, lastDay }
}
export function getStartAndEndOfMonth() {
    const startOfMonth = moment().startOf('month').toDate()
    const endOfMonth = moment().endOf('month').toDate()
    return { startOfMonth, endOfMonth }
}

export function abbreviateNumber(value: any) {
    const res = Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value)
    return res !== 'NaN' ? res : '0'
}
export function sumSum(array: Array<any>, sum = 'quantity') {
    let re = 0
    fastLoop(array, (a: any, index: number) => {
        re += Number(a[sum])
    })
    return re
}

export const personalNumberToDob = (p = '') => {
    if (isValid(p)) {
        const str = p
        const onlyNumbers = str.replace(/\D/g, '')
        const flat = String(onlyNumbers).substring(0, 8)
        const date: any = `${flat.slice(0, 4)}-${flat.slice(4, 6)}-${flat.slice(6, 8)}`
        return date
    }
}

export function getAge(dateString: any, FM: any, bool = false) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const yearNow = now.getFullYear()
    const monthNow = now.getMonth()
    const dateNow = now.getDate()
    const getDob = personalNumberToDob(dateString)
    const dob = new Date(getDob)

    const yearDob = dob.getFullYear()
    const monthDob = dob.getMonth()
    const dateDob = dob.getDate()

    let age: any = {}
    let ageString: any = 'Invalid Age'
    let yearString: any = ''
    let monthString: any = ''
    let dayString: any = ''

    let yearAge = yearNow - yearDob
    let monthAge: any = ''
    let dateAge: any = ''

    if (monthNow >= monthDob) {
        monthAge = monthNow - monthDob
    } else {
        yearAge--
        monthAge = 12 + monthNow - monthDob
    }

    if (dateNow >= dateDob) {
        dateAge = dateNow - dateDob
    } else {
        monthAge--
        dateAge = 31 + dateNow - dateDob

        if (monthAge < 0) {
            monthAge = 11
            yearAge--
        }
    }

    age = {
        years: yearAge,
        months: monthAge,
        days: dateAge
    }

    if (age.years > 1) yearString = FM('years-old')
    else yearString = FM('year-old')
    if (age.months > 1) monthString = FM('months-old')
    else monthString = FM('month-old')
    if (age.days > 1) dayString = FM('days-old')
    else dayString = FM('day-old')

    if (age.years > 0) {
        ageString = `${age.years} ${yearString}`
    } else if (age.months > 0) {
        ageString = `${age.months} ${monthString}`
    } else if (age.days > 0) {
        ageString = `${age.days} ${dayString}`
    }
    // log("age", age)
    return bool ? (age.years > 0 || age.months > 0 || age.days > 0) && age?.years < 125 : ageString
}
export function generateArrayOfYears(m = 9) {
    const max = new Date().getFullYear()
    const min = max - m
    const years: any = []

    for (let i: number = max; i >= min; i--) {
        years.push(i)
    }
    return years
}
export const setInputErrors = (fields: any, setError: (e: any, a: any) => void) => {
    for (const key in fields) {
        if (Object.hasOwnProperty.call(fields, key)) {
            if (isValidArray(fields[key])) {
                const message = fields[key].join(', ')
                setError(key, { message, type: 'api' })
            }
        }
    }
}

export const SpaceTrim = (str: string) => {
    return /^\s*$/.test(str)
}

export const maskNumber = ({ str = '', len = 0 }: { str: string; len: number }) => {
    const res = `${str.slice(0, -8)}XXXXXXXX`
    return res
}
export function endOfMonths(date: any) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export const enableFutureDates = (date: any) => {
    if (date >= new Date()) {
        return true
    } else {
        return false
    }
}

export const getVatValue = (vat = 0, amount = 0) => {
    return Number(((vat / 100) * amount).toFixed(2))
}

export const toFixed = (amount = 0, fixed = 2) => {
    return Number(amount).toFixed(fixed)
}

export function stripHtml(html?: string) {
    if (html) {
        var regex = /<\/?[^>]+(>|$)/gi
        const body = html
        const hasText = !!body.replace(/(\r\n|\n|\r)/gm, '').replace(regex, '').length
        return hasText
    } else {
        return false
    }
}

export const isValidUrl = (urlString: string) => {
    if (urlString) {
        try {
            return Boolean(new URL(urlString))
        } catch (e) {
            return false
        }
    } else {
        return false
    }
}

export function makeLinksClickable(text?: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    if (isValid(text)) {
        return text?.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + '</a>'
        })
    } else {
        return ''
    }
}

export function formatDateTime(dateTimeStr) {
    // Split the date and time parts
    const [datePart, timePart] = dateTimeStr.split(' ')

    // Split the date parts
    const [day, month, year] = datePart.split('-').map(Number)

    // Split the time parts and set default seconds if not provided
    const timeParts = timePart.split(':').map(Number)
    const hours = timeParts[0]
    const minutes = timeParts[1]
    const seconds = timeParts.length > 2 ? timeParts[2] : 0

    // Create a new Date object using the parsed values
    const date = new Date(year, month - 1, day, hours, minutes, seconds)

    // Format the date and time components
    const formattedDay = String(date.getDate()).padStart(2, '0')
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0')
    const formattedYear = date.getFullYear()

    const formattedHours = String(date.getHours()).padStart(2, '0')
    const formattedMinutes = String(date.getMinutes()).padStart(2, '0')
    const formattedSeconds = String(date.getSeconds()).padStart(2, '0')

    // Format the date and time
    const formattedDateTime = `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`

    return formattedDateTime
}

import { JsonParseValidate, formatDate } from '@src/utility/Utils'
import React from 'react'
const KichenPrints = React.forwardRef((props: any, ref: any) => {

    return (
        <div
            style={{
                margin: 0,
                padding: 0
            }}
            ref={ref}
        >

            <table
                style={{
                    pageBreakBefore: 'always',
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    // padding: 5,
                    fontFamily: 'inherit',
                    color: '#000',
                    textAlign: 'center'
                    // fontWeight: "bolder"
                }}
            >
                <thead>
                    <tr>
                        <th
                            colSpan={6}
                            style={{
                                fontSize: '14px',
                                fontWeight: 'normal'
                            }}
                        >
                            Kitchen Copy
                            <hr
                                style={{
                                    borderColor: '#000'
                                }}
                            />
                        </th>
                    </tr>
                    <tr>
                        <th
                            colSpan={3}
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'left'
                            }}
                        >
                            Invoice no. {props?.props?.order_number}
                        </th>
                        <th
                            colSpan={3}
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'right'
                            }}
                        >
                            Date: {formatDate(props?.props?.created_at, 'DD/MM/YY hh:mm A')}
                        </th>
                    </tr>
                    <tr>
                        <th
                            colSpan={3}
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'left'
                            }}
                        >
                            Table No. {props?.props?.table_number}
                        </th>
                        {/* <th colSpan={3} style={{
                            fontSize: "11px",
                            fontWeight: 'normal',
                            textAlign: 'right'

                        }}>
                            Total qty: {props?.props?.cartTotalQuantity}
                        </th> */}
                    </tr>
                    <tr>
                        <th
                            colSpan={3}
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'left'
                            }}
                        >
                            Employee:   {props?.props?.employee?.name}
                        </th>
                        {/* <th colSpan={3} style={{
                            fontSize: "11px",
                            fontWeight: 'normal',
                            textAlign: 'right'

                        }}>
                            Total qty: {props?.props?.cartTotalQuantity}
                        </th> */}
                    </tr>
                    <tr>
                        <th colSpan={6}>
                            <hr
                                style={{
                                    borderColor: '#000'
                                }}
                            />
                        </th>
                    </tr>
                </thead>
                <tbody
                    style={{
                        fontSize: '11px',
                        fontWeight: 'normal'
                    }}
                >
                    <tr>
                        {/* <th style={{ textAlign: 'left' }}>#</th> */}
                        <th style={{ textAlign: 'left' }}>Item Name</th>
                        {/* <th style={{ textAlign: 'left' }}>Time</th>*/}
                        <th style={{ textAlign: 'left' }}>Price</th>
                        <th style={{ textAlign: 'right' }} colSpan={4}>
                            Qty
                        </th>
                        {/* <th style={{ textAlign: 'left' }}>Total</th> */}
                    </tr>
                    {props?.props?.order_details?.map((d: any, i: any) => {
                        const menu = JsonParseValidate(d?.menu_detail)
                        return (
                            <>
                                <tr>
                                    {/* <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{i + 1}</td> */}
                                    <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{menu?.name}</td>

                                    {/* <td style={{ textAlign: 'left' }}>{d?.order_duration} Min</td> */}
                                    <td style={{ textAlign: 'left' }}>{d?.price}</td>
                                    <td style={{ textAlign: 'right', verticalAlign: 'top' }} colSpan={4}>
                                        {d?.quantity}
                                    </td>
                                    {/* <td style={{ textAlign: 'left' }}>{Math.floor(d?.quantity * d?.price).toFixed(2)}</td> */}
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{d?.instructions}</td>
                                </tr>
                            </>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={6}>
                            <hr
                                style={{
                                    borderColor: '#000'
                                }}
                            />
                        </th>
                    </tr>

                </tfoot>
            </table>
        </div>
    )
})

export default KichenPrints

import { JsonParseValidate, formatDate, log, truncateText } from '@src/utility/Utils'
import React from 'react'

const OrderPrints = React.forwardRef((props: any, ref: any) => {
  // log('OrderPrints', props)
  const address1 = truncateText(props?.props?.cafe?.address, 23)
  const address2: string = props?.props?.cafe?.address?.slice(23, 200)
  const discount = props?.props?.total_amount - props?.props?.payable_amount
  let discountAmount = discount.toFixed(2)
  const Qrcode = props?.props?.cafe?.payment_qr_codes.map((item) => {
    return item?.qr_code_image_path
  })
  const totalDiscount = props?.props?.order_details
    .reduce((acc, d) => acc + (parseFloat(d.discount_amount) || 0), 0)
    .toFixed(2)

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
          margin: 0,
          padding: 0,
          width: '100%',
          // padding: 5,
          fontFamily: 'inherit',
          color: '#000',
          textAlign: 'center'
          // fontWeight: "bolder"  width: '153.6px', height: '153.6px'
        }}
      >
        <thead>
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000000'
              }}
            >
              <img
                src={props?.props?.cafe?.profile_image_path}
                height={'100px'}
                width={'100px'}
                style={{
                  marginBottom: 5,
                  marginTop: 0,
                  maxWidth: 100,
                  maxHeight: 100,
                  color: '#000000'
                }}
              />
            </th>
            {/* <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000000'
              }}
            >
              <img
                src={Qrcode}
                style={{ width: '100%', height: '8vh', marginBottom: 5 }}
              />
            </th> */}
          </tr>
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '11px',
                fontWeight: 'normal'
              }}
            >
              <div className='text-capitalize text-wrap'>{address1}</div>
              <div className='text-capitalize text-wrap'>{address2}</div>

              {/* <div>Bawadiya Kalan, Bhopal</div> */}
              <div>
                <span className='me-1'>+91 {props?.props?.cafe?.mobile}</span>{' '}
                <span>+91 {props?.props?.cafe?.contact_person_phone}</span>
              </div>
              <div>chaihojaye.bpl@gmail.com</div>
            </th>
          </tr>
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              <hr style={{ borderColor: '#000', margin: 0, marginTop: 5, padding: 0 }} />
              Invoice
              <hr style={{ borderColor: '#000', margin: 0, marginBottom: 5, padding: 0 }} />
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
            {props?.props?.cafe?.gst_no ? (
              <>
                <th
                  colSpan={3}
                  style={{
                    fontSize: '11px',
                    fontWeight: 'normal',
                    textAlign: 'right'
                  }}
                >
                  GST No: {props?.props?.cafe?.gst_no}
                </th>
              </>
            ) : (
              <></>
            )}
          </tr>
          <tr style={{ margin: 0, padding: 0 }}>
            <th colSpan={6} style={{ margin: 0, padding: 0 }}>
              <hr style={{ margin: 0, borderColor: '#000', marginTop: 5, padding: 0 }} />
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
            <th style={{ textAlign: 'left' }} colSpan={2}>
              Item Name
            </th>
            {/* <th style={{ textAlign: 'left' }}>Time</th> */}
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Price</th>

            <th style={{ textAlign: 'right' }}>Discount</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
          <tr style={{ margin: 0, padding: 0 }}>
            <th colSpan={6} style={{ margin: 0, padding: 0 }}>
              <hr style={{ margin: 0, padding: 0, borderColor: '#000' }} />
            </th>
          </tr>
          {props?.props?.order_details?.map((d: any, i: any) => {
            const menu = JsonParseValidate(d?.menu_detail)
            let totalDiscount: any = 0
            let disco = parseInt(d?.discount_amount)

            props?.props?.order_details?.forEach((d: any) => {
              totalDiscount += parseFloat(d?.discount_amount) || 0
            })

            return (
              <tr>
                {/* <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{i + 1}</td> */}
                <td style={{ textAlign: 'left', verticalAlign: 'top' }} colSpan={2}>
                  {menu?.name}
                  <br />
                  <div style={{ fontSize: '8px', fontWeight: 'normal' }}>
                    {menu?.order_duration} Min
                  </div>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{d?.quantity}</td>

                {/* <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{d?.order_duration} Min</td> */}
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                  {Math.floor(d?.price).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                  {d?.discount_amount} (₹)
                  <br />
                  <div style={{ fontSize: '8px', fontWeight: 'normal' }}>{d?.discount_per} %</div>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                  {(Number(d?.total) - Number(d?.discount_amount)).toFixed(2)}
                </td>
              </tr>
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
          <tr>
            <th
              colSpan={5}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              Subtotal (₹) :
            </th>
            <th
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              {(
                parseFloat(props?.props?.total_amount || 0) + parseFloat(totalDiscount || 0)
              ).toFixed(2)}
            </th>
          </tr>
          <tr>
            <th
              colSpan={5}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              Discount (₹) :
            </th>
            <th
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              -{totalDiscount ?? 0}
            </th>
          </tr>
          <tr>
            <th
              colSpan={5}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              Taxes (₹) :
            </th>
            <th
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              +{props?.props?.tax_amount ?? 0}
            </th>
          </tr>

          {/* <tr>
                        <th
                            colSpan={5}
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'right'
                            }}
                        >
                            Discount (₹) :
                        </th>
                        <th
                            style={{
                                fontSize: '11px',
                                fontWeight: 'normal',
                                textAlign: 'right'
                            }}
                        >
                            {totalDiscount}
                        </th>
                    </tr> */}
          <tr>
            <th
              colSpan={5}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              Total (₹) :
            </th>
            <th
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right'
              }}
            >
              {parseFloat(props?.props?.payable_amount).toFixed(2) ?? 0}
            </th>
          </tr>
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              <hr
                style={{
                  borderColor: '#000'
                }}
              />
              THANK YOU!
            </th>
          </tr>
          {props?.props?.cafe?.payment_qr_codes.length > 0 ? (
            <>
              <tr>
                <th
                  colSpan={6}
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  <hr
                    style={{
                      borderColor: '#000'
                    }}
                  />
                  <img src={Qrcode} style={{ width: '25%', height: '5%', marginBottom: 5 }} />
                  <br />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    {' '}
                    Scan for Payment
                  </span>
                </th>
              </tr>
            </>
          ) : (
            ''
          )}
        </tfoot>
      </table>
      {/* <table
                style={{
                    pageBreakBefore: 'always',
                    width: '100%',
                    margin: 0,
                    padding: 0,

                    fontFamily: 'inherit',
                    color: '#000',
                    textAlign: 'center'

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
                            Invoice no. {props?.props?.id}
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

                        <th style={{ textAlign: 'left' }}>Item Name</th>

                        <th style={{ textAlign: 'right' }} colSpan={4}>
                            Qty
                        </th>

                    </tr>
                    {props?.props?.order_details?.map((d: any, i: any) => {
                        const menu = JsonParseValidate(d?.menu_detail)
                        return (
                            <>
                                <tr>

                                    <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{menu?.name}</td>


                                    <td style={{ textAlign: 'right', verticalAlign: 'top' }} colSpan={4}>
                                        {d?.quantity}
                                    </td>

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
            </table> */}
    </div>
  )
})

export default OrderPrints

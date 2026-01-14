import { JsonParseValidate, formatDate, log, truncateText } from '@src/utility/Utils'
import React from 'react'

const ItemTransferPrint = React.forwardRef((props: any, ref: any) => {
  //   log('OrderPrints', props)
  const address1 = truncateText(props?.props?.cafe?.address, 23)
  const address2: string = props?.props?.cafe?.address?.slice(23, 200)
  const discount = props?.props?.total_amount - props?.props?.payable_amount
  let discountAmount = discount.toFixed(2)
  const Qrcode = props?.props?.cafe?.payment_qr_codes.map((item) => {
    return item?.qr_code_image_path
  })
  const totalDiscount = props?.props?.items
    .reduce((acc, d) => acc + (parseFloat(d.rate) * parseFloat(d?.quantity) || 0), 0)
    .toFixed(2)

  //   return (
  //     <div
  //       style={{
  //         margin: 0,
  //         padding: 0
  //       }}
  //       ref={ref}
  //     >
  //       <table
  //         style={{
  //           margin: 0,
  //           padding: 0,
  //           width: '100%',
  //           // padding: 5,
  //           fontFamily: 'inherit',
  //           color: '#000',
  //           textAlign: 'center'
  //           // fontWeight: "bolder"  width: '153.6px', height: '153.6px'
  //         }}
  //       >
  //         <thead>
  //           <tr>
  //             {/* <th
  //               colSpan={6}
  //               style={{
  //                 fontSize: '14px',
  //                 fontWeight: 'bold',
  //                 color: '#000000'
  //               }}
  //             >
  //               <img
  //                 src={props?.props?.cafe?.profile_image_path}
  //                 height={'100px'}
  //                 width={'100px'}
  //                 style={{
  //                   marginBottom: 5,
  //                   marginTop: 0,
  //                   maxWidth: 100,
  //                   maxHeight: 100,
  //                   color: '#000000'
  //                 }}
  //               />
  //             </th> */}
  //             {/* <th
  //               colSpan={6}
  //               style={{
  //                 fontSize: '14px',
  //                 fontWeight: 'bold',
  //                 color: '#000000'
  //               }}
  //             >
  //               <img
  //                 src={Qrcode}
  //                 style={{ width: '100%', height: '8vh', marginBottom: 5 }}
  //               />
  //             </th> */}
  //           </tr>
  //           <tr>
  //             <th
  //               colSpan={6}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal'
  //               }}
  //             >
  //               <div className='text-capitalize text-wrap'>{address1}</div>
  //               <div className='text-capitalize text-wrap'>{address2}</div>

  //               {/* <div>Bawadiya Kalan, Bhopal</div> */}
  //               <div>
  //                 <span className='me-1'>+91 {props?.props?.cafe?.mobile}</span>{' '}
  //                 <span>+91 {props?.props?.cafe?.contact_person_phone}</span>
  //               </div>
  //               <div>chaihojaye.bpl@gmail.com</div>
  //             </th>
  //           </tr>
  //           <tr>
  //             <th
  //               colSpan={6}
  //               style={{
  //                 fontSize: '14px',
  //                 fontWeight: 'normal'
  //               }}
  //             >
  //               <hr style={{ borderColor: '#000', margin: 0, marginTop: 5, padding: 0 }} />
  //               Invoice
  //               <hr style={{ borderColor: '#000', margin: 0, marginBottom: 5, padding: 0 }} />
  //             </th>
  //           </tr>
  //           <tr>
  //             <th
  //               colSpan={3}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'left'
  //               }}
  //             >
  //               Invoice no. {props?.props?.order_number}
  //             </th>
  //             <th
  //               colSpan={3}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Date: {formatDate(props?.props?.created_at, 'DD/MM/YY hh:mm A')}
  //             </th>
  //           </tr>
  //           <tr>
  //             <th
  //               colSpan={3}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'left'
  //               }}
  //             >
  //               Table No. {props?.props?.table_number}
  //             </th>
  //             {/* <th
  //               colSpan={3}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Discount (₹): {totalDiscount}
  //             </th> */}
  //           </tr>
  //           <tr style={{ margin: 0, padding: 0 }}>
  //             <th colSpan={6} style={{ margin: 0, padding: 0 }}>
  //               <hr style={{ margin: 0, borderColor: '#000', marginTop: 5, padding: 0 }} />
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody
  //           style={{
  //             fontSize: '11px',
  //             fontWeight: 'normal'
  //           }}
  //         >
  //           <tr>
  //             {/* <th style={{ textAlign: 'left' }}>#</th> */}
  //             <th style={{ textAlign: 'left' }} colSpan={2}>
  //               Item Name
  //             </th>
  //             {/* <th style={{ textAlign: 'left' }}>Time</th> */}
  //             <th style={{ textAlign: 'right' }}>Qty</th>
  //             <th style={{ textAlign: 'right' }}>Rate</th>

  //             <th style={{ textAlign: 'right' }}>Sub Total</th>
  //             {/* <th style={{ textAlign: 'right' }}>Total</th> */}
  //           </tr>
  //           <tr style={{ margin: 0, padding: 0 }}>
  //             <th colSpan={6} style={{ margin: 0, padding: 0 }}>
  //               <hr style={{ margin: 0, padding: 0, borderColor: '#000' }} />
  //             </th>
  //           </tr>
  //           {props?.props?.items?.map((d: any, i: any) => {
  //             const menu = JsonParseValidate(d?.menu_detail)
  //             let totalDiscount: any = 0
  //             let disco = parseInt(d?.discount_amount)

  //             props?.props?.order_details?.forEach((d: any) => {
  //               totalDiscount += parseFloat(d?.discount_amount) || 0
  //             })

  //             return (
  //               <tr>
  //                 {/* <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{i + 1}</td> */}
  //                 <td style={{ textAlign: 'left', verticalAlign: 'top' }} colSpan={2}>
  //                   {d?.item_id?.label}
  //                   {/* <br /> */}
  //                   {/* <div style={{ fontSize: '8px', fontWeight: 'normal' }}>
  //                     {menu?.order_duration} Min
  //                   </div> */}
  //                 </td>
  //                 <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{d?.quantity}</td>

  //                 {/* <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{d?.order_duration} Min</td> */}
  //                 <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
  //                   {Math.floor(d?.rate).toFixed(2)}
  //                 </td>
  //                 <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
  //                   {Number(d?.rate) * Number(d?.quantity)} (₹)
  //                   {/* <br />
  //                   <div style={{ fontSize: '8px', fontWeight: 'normal' }}>{d?.discount_per} %</div> */}
  //                 </td>
  //                 {/* <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
  //                   {(Number(d?.total) - Number(d?.discount_amount)).toFixed(2)}
  //                 </td> */}
  //               </tr>
  //             )
  //           })}
  //         </tbody>
  //         <tfoot>
  //           {/* <tr>
  //             <th colSpan={6}>
  //               <hr
  //                 style={{
  //                   borderColor: '#000'
  //                 }}
  //               />
  //             </th>
  //           </tr> */}
  //           {/* <tr>
  //             <th
  //               colSpan={5}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Subtotal (₹) :
  //             </th>
  //             <th
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >

  //             </th>
  //           </tr> */}
  //           {/* <tr>
  //             <th
  //               colSpan={5}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Discount (₹) :
  //             </th>
  //             <th
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >

  //             </th>
  //           </tr> */}
  //           {/* <tr>
  //             <th
  //               colSpan={5}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Taxes (₹) :
  //             </th>
  //             <th
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               +{props?.props?.tax_amount ?? 0}
  //             </th>
  //           </tr> */}

  //           {/* <tr>
  //                         <th
  //                             colSpan={5}
  //                             style={{
  //                                 fontSize: '11px',
  //                                 fontWeight: 'normal',
  //                                 textAlign: 'right'
  //                             }}
  //                         >
  //                             Discount (₹) :
  //                         </th>
  //                         <th
  //                             style={{
  //                                 fontSize: '11px',
  //                                 fontWeight: 'normal',
  //                                 textAlign: 'right'
  //                             }}
  //                         >
  //                             {totalDiscount}
  //                         </th>
  //                     </tr> */}
  //           <tr>
  //             <th
  //               colSpan={5}
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               Total (₹) :
  //             </th>
  //             <th
  //               style={{
  //                 fontSize: '11px',
  //                 fontWeight: 'normal',
  //                 textAlign: 'right'
  //               }}
  //             >
  //               {parseFloat(totalDiscount) ?? 0}
  //             </th>
  //           </tr>
  //           <tr>
  //             <th
  //               colSpan={6}
  //               style={{
  //                 fontSize: '14px',
  //                 fontWeight: 'bold',
  //                 textAlign: 'center'
  //               }}
  //             >
  //               <hr
  //                 style={{
  //                   borderColor: '#000'
  //                 }}
  //               />
  //               THANK YOU!
  //             </th>
  //           </tr>
  //         </tfoot>
  //       </table>
  //     </div>
  //   )
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#000'
      }}
      ref={ref}
    >
      <table
        style={{
          margin: 0,
          padding: 0,
          width: '100%',
          fontFamily: 'inherit',
          color: '#000',
          textAlign: 'center',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          {/* Logo Section */}
          {/* {props?.props?.cafe?.profile_image_path && (
            <tr>
              <th
                colSpan={6}
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#000000',
                  paddingBottom: '10px'
                }}
              >
                <img
                  src={props?.props?.cafe?.profile_image_path}
                  height={'80px'}
                  width={'80px'}
                  style={{
                    marginBottom: 5,
                    marginTop: 0,
                    maxWidth: 80,
                    maxHeight: 80,
                    borderRadius: '50%'
                  }}
                  alt='Logo'
                />
              </th>
            </tr>
          )} */}

          {/* Business Info */}
          {/* <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                paddingBottom: '5px'
              }}
            >
              {props?.props?.transfer_to_cafe?.name || 'Chai Ho Jaye'}
            </th>
          </tr> */}

          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                color: '#666',
                paddingBottom: '10px'
              }}
            >
              <div style={{ marginBottom: '3px' }}>{address1}</div>
              {address2 && <div style={{ marginBottom: '3px' }}>{address2}</div>}
              <div style={{ marginBottom: '3px' }}>
                <span style={{ marginRight: '10px' }}>+91 {props?.props?.cafe?.mobile}</span>
                <span>+91 {props?.props?.cafe?.contact_person_phone}</span>
              </div>
              <div>chaihojaye.bpl@gmail.com</div>
            </th>
          </tr>

          {/* Invoice Title */}
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                padding: '10px 0'
              }}
            >
              <hr style={{ borderColor: '#000', margin: '0 0 5px 0', padding: 0 }} />
              from: warehouse
              <hr style={{ borderColor: '#000', margin: '5px 0 0 0', padding: 0 }} />
            </th>
          </tr>

          {/* Invoice Details */}
          <tr>
            <th
              colSpan={3}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'left',
                paddingBottom: '5px'
              }}
            >
              Cafe To Transfer: {props?.props?.transfer_to_cafe?.label}
            </th>
            <th
              colSpan={3}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'right',
                paddingBottom: '5px'
              }}
            >
              Date: {formatDate(props?.props?.transfer_date)}
            </th>
          </tr>

          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '11px',
                fontWeight: 'normal',
                textAlign: 'left',
                paddingBottom: '10px'
              }}
            >
              {/* Table No: {props?.props?.table_number} */}
            </th>
          </tr>

          <tr>
            <th colSpan={6} style={{ margin: 0, padding: 0 }}>
              <hr style={{ margin: 0, borderColor: '#000', padding: 0 }} />
            </th>
          </tr>
        </thead>

        <tbody style={{ fontSize: '11px', fontWeight: 'normal' }}>
          {/* Table Headers */}
          <tr>
            <th style={{ textAlign: 'left', padding: '5px 0' }} colSpan={2}>
              Item Name
            </th>
            <th style={{ textAlign: 'right', padding: '5px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '5px 0' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '5px 0' }}>Sub Total</th>
          </tr>

          <tr>
            <th colSpan={6} style={{ margin: 0, padding: 0 }}>
              <hr style={{ margin: 0, padding: 0, borderColor: '#000' }} />
            </th>
          </tr>

          {/* Items */}
          {props?.props?.items?.map((item, index) => {
            const menu = JsonParseValidate(item?.menu_detail)
            const subtotal = Number(item?.rate) * Number(item?.quantity)

            return (
              <tr key={index}>
                <td
                  style={{ textAlign: 'left', verticalAlign: 'top', padding: '3px 0' }}
                  colSpan={2}
                >
                  {item?.item_id?.label}
                  {/* {menu?.order_duration && (
                    <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                      {menu.order_duration} Min
                    </div>
                  )} */}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', padding: '3px 0' }}>
                  {item?.quantity}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', padding: '3px 0' }}>
                  ₹{Number(item?.rate).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', padding: '3px 0' }}>
                  ₹{subtotal.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>

        <tfoot>
          <tr>
            <th colSpan={6}>
              <hr style={{ borderColor: '#000', margin: '10px 0 5px 0' }} />
            </th>
          </tr>

          {/* Total */}
          <tr>
            <th
              colSpan={4}
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'right',
                padding: '5px 0'
              }}
            >
              Total (₹):
            </th>
            <th
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'right',
                padding: '5px 0'
              }}
            >
              ₹{parseFloat(totalDiscount) || 0}
            </th>
          </tr>

          {/* QR Code */}
          {/* {Qrcode && Qrcode[0] && (
            <tr>
              <th
                colSpan={6}
                style={{
                  fontSize: '11px',
                  fontWeight: 'normal',
                  padding: '10px 0'
                }}
              >
                <div style={{ marginBottom: '5px' }}>Scan to Pay</div>
                <img
                  src={Qrcode[0]}
                  style={{ width: '100px', height: '100px', border: '1px solid #ccc' }}
                  alt='QR Code'
                />
              </th>
            </tr>
          )} */}

          {/* Thank You */}
          <tr>
            <th
              colSpan={6}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '15px 0 5px 0'
              }}
            >
              <hr style={{ borderColor: '#000', marginBottom: '10px' }} />
              THANK YOU!
              <div
                style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '5px', color: '#666' }}
              >
                {/* Visit Again Soon */}
              </div>
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  )
})

export default ItemTransferPrint

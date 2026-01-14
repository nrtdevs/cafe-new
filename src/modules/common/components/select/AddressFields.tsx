import { useEffect, useState } from 'react'
import GooglePlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete'
import { mapApiKey } from '@src/utility/Const'
import { FM, log } from '@src/utility/Utils'
import { formatAndSetData, selectThemeColors } from '@src/utility/Utils'

const AddressField = ({ options = null, handleAddress = (e: any) => {}, defaultValue = null }) => {
  const [value, setValue] = useState<any>(null)
  const [option, setOption] = useState(null)

  useEffect(() => {
    setValue({ label: defaultValue, value: defaultValue })
  }, [defaultValue])

  // useEffect(() => {
  //     setOption(options)
  // }, [options])

  const geoCodeDecode = (place_id: any) => {
    geocodeByPlaceId(place_id)
      .then((results) => {
        const place = results[0]
        handleAddress({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          ...formatAndSetData(place)
        })
      })
      .catch((error) => {
        log(error)
      })
  }
  const select = {
    noOptionsMessage: () => null,
    components: { DropdownIndicator: () => null, IndicatorSeparator: () => null },
    placeholder: FM('search'),
    // options: option,
    theme: selectThemeColors,
    className: 'react-select',
    // value: value,
    onChange: (d: any) => {
      setValue(d)
      geoCodeDecode(d?.value?.place_id)
    }
  }
  //   if (defaultValue !== null) {
  //     select.value = value
  //   }
  return (
    <>
      <GooglePlacesAutocomplete
        apiKey={mapApiKey}
        autocompletionRequest={{
          componentRestrictions: {
            country: ['in']
          }
          // types: ['address']
        }}
        selectProps={select}
      />
    </>
  )
}

export default AddressField

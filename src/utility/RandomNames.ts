import {
  uniqueNamesGenerator,
  starWars,
  NumberDictionary,
  animals,
  colors,
  countries,
  languages,
  adjectives,
  Config,
  names
} from 'unique-names-generator'

const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

function RandomNames(
  length = 2,
  enableAdjective = false,
  colorAndCountry = false,
  onlyCountry = false
) {
  let dictionaries = [names, colors, languages, countries]
  if (enableAdjective) {
    dictionaries = [adjectives, names, colors, languages, countries]
  }
  if (colorAndCountry) {
    dictionaries = [colors, countries]
  }
  if (onlyCountry) {
    dictionaries = [countries]
  }
  const config: Config = {
    dictionaries,
    length,
    separator: ' ',
    style: 'capital'
  }
  const characterName: string = uniqueNamesGenerator(config)
  return characterName
}

export default RandomNames

import { escapeRegExp } from 'lodash'

const findPattern = (str) => {
  const offset = 44032 // '가'
  // 한국어 음절
  if (/[가-힣]/.test(str)){
    const charCode = str.charCodeAt(0) - offset
    if (charCode % 28 > 0) return str
    const begin = Math.floor(charCode / 28) * 28 + offset
    const end = begin + 27
    return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`
  }

  // 한글 자음
  if (/[ㄱ-ㅎ]/.test(str)) {
    const consonantStyle = {
      'ㄱ': '가'.charCodeAt(0),
      'ㄲ': '까'.charCodeAt(0),
      'ㄴ': '나'.charCodeAt(0),
      'ㄷ': '다'.charCodeAt(0),
      'ㄸ': '따'.charCodeAt(0),
      'ㄹ': '라'.charCodeAt(0),
      'ㅁ': '마'.charCodeAt(0),
      'ㅂ': '바'.charCodeAt(0),
      'ㅃ': '빠'.charCodeAt(0),
      'ㅅ': '사'.charCodeAt(0)
    }
    const begin = consonantStyle[str] || ((str.charCodeAt(0) - 12613 /* 'ㅅ'의 코드 */) * 588 + consonantStyle['ㅅ'])
    const end = begin + 587
    return `[${str}\\u${begin.toString(16)}-\\u${end.toString(16)}]`
  }

  return escapeRegExp(str)
}

const fuzzyStringSearch = (txt) => {
  const pattern = txt.split('').map(findPattern).join('.*?')
  return new RegExp(pattern)
}

export default fuzzyStringSearch

  // * 출처: https://taegon.kim/archives/9919
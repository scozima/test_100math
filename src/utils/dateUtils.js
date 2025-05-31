import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import 'dayjs/locale/en'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import localizedFormat from 'dayjs/plugin/localizedFormat'

// プラグインを拡張
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(localizedFormat)

/**
 * Firebase Timestampまたは数値を日付文字列にフォーマット
 * @param {*} timestamp - Firebase timestamp または数値
 * @param {string} locale - ロケール ('ja' or 'en')
 * @returns {string} フォーマットされた日付文字列
 */
export const formatDate = (timestamp, locale = 'ja') => {
  if (!timestamp) return ''

  let date
  // timestampがオブジェクトの場合（Firestore timestamp）
  if (typeof timestamp === 'object' && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  }
  // timestampが数値の場合（ミリ秒）
  else if (typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else {
    return ''
  }

  // 指定された言語に基づいてフォーマット
  return dayjs(date).locale(locale).format('MM/DD (ddd)')
}

/**
 * 日付範囲のラベルを取得
 * @param {Date} currentDate - 現在の日付
 * @param {string} dateRange - 日付範囲 ('day', 'week', 'month')
 * @param {string} locale - ロケール
 * @returns {string} 日付範囲のラベル
 */
export const getDateRangeLabel = (currentDate, dateRange, locale = 'ja') => {
  const current = dayjs(currentDate).locale(locale)
  
  switch (dateRange) {
    case 'day':
      return current.format('YYYY年M月D日')
    case 'week': {
      const weekStart = current.startOf('week')
      const weekEnd = current.endOf('week')
      return `${weekStart.format('M/D')} - ${weekEnd.format('M/D')}`
    }
    case 'month':
      return current.format('YYYY年M月')
    default:
      return ''
  }
}

/**
 * 日付を前後に移動
 * @param {Date} currentDate - 現在の日付
 * @param {string} dateRange - 日付範囲
 * @param {number} direction - 方向 (1: 次, -1: 前)
 * @returns {Date} 移動後の日付
 */
export const navigateDate = (currentDate, dateRange, direction) => {
  const current = dayjs(currentDate)
  
  switch (dateRange) {
    case 'day':
      return current.add(direction, 'day').toDate()
    case 'week':
      return current.add(direction, 'week').toDate()
    case 'month':
      return current.add(direction, 'month').toDate()
    default:
      return currentDate
  }
}

/**
 * チャート用の日付をフォーマット
 * @param {*} value - 日付値
 * @param {string} locale - ロケール
 * @returns {string} フォーマットされた日付
 */
export const formatChartDate = (value, locale = 'ja') => {
  const date = new Date(value)
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

/**
 * ツールチップ用の日付をフォーマット
 * @param {*} value - 日付値
 * @param {string} locale - ロケール
 * @returns {string} フォーマットされた日付
 */
export const formatTooltipDate = (value, locale = 'ja') => {
  const date = new Date(value)
  return date.toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
} 
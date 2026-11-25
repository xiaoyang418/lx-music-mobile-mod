import { useRef } from 'react'
import { TouchableOpacity } from 'react-native'

import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import PlayQueue, { type PlayQueueType } from './PlayQueue'

/**
 * 播放队列按钮，图标跟随主题色
 * @param size 图标大小
 * @param width 按钮宽度，未指定时由外部容器控制
 * @param height 按钮高度
 * @param color 图标颜色，默认使用主题按钮色
 */
export default ({ size = 22, width, height, color }: {
  size?: number
  width?: number
  height?: number
  color?: string
}) => {
  const theme = useTheme()
  const t = useI18n()
  const queueRef = useRef<PlayQueueType>(null)

  const handleShow = () => {
    queueRef.current?.show()
  }

  return (
    <>
      <TouchableOpacity
        style={{ ...styles.cotrolBtn, width, height }}
        activeOpacity={0.5}
        accessibilityLabel={t('play_queue')}
        onPress={handleShow}
      >
        <Icon name="list-order" color={color ?? theme['c-button-font']} rawSize={size} />
      </TouchableOpacity>
      <PlayQueue ref={queueRef} />
    </>
  )
}

const styles = createStyle({
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})

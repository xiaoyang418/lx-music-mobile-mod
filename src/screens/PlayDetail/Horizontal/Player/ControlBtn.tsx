import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
// import { useIsPlay } from '@/store/player/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
// import { scaleSizeW } from '@/utils/pixelRatio'
import { useIsPlay } from '@/store/player/hook'
import { useLayout } from '@/utils/hooks'
import { marginLeft } from '../constant'
import { BTN_WIDTH } from '../MoreBtn/Btn'
import PlayQueueBtn from '@/components/player/PlayQueueBtn'

// const WIDTH = scaleSizeW(48)

const PrevBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const handlePlayPrev = () => {
    void playPrev()
  }
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={handlePlayPrev}>
      <Icon name='prevMusic' color={theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}
const NextBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const handlePlayNext = () => {
    void playNext()
  }
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={handlePlayNext}>
      <Icon name='nextMusic' color={theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}

const TogglePlayBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const isPlay = useIsPlay()
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: size, height: size }} activeOpacity={0.5} onPress={togglePlay}>
      <Icon name={isPlay ? 'pause' : 'play'} color={theme['c-button-font']} rawSize={size * 0.7} />
    </TouchableOpacity>
  )
}

const MIN_SIZE = BTN_WIDTH * 1.1
export default () => {
  const { onLayout, height, width } = useLayout()
  const theme = useTheme()
  const size = Math.max(Math.min(height * 0.65, (width - marginLeft) * 0.52 * 0.28) * global.lx.fontSize, MIN_SIZE)
  return (
    <View style={{ ...styles.content, gap: size * 0.4 }} onLayout={onLayout}>
      <PrevBtn size={size} />
      <TogglePlayBtn size={size}/>
      <NextBtn size={size} />
      {/* 队列按钮固定在最右侧，与其他按钮分开 */}
      <View style={styles.queueWrap}>
        <PlayQueueBtn size={size * 0.62} width={size} height={size} color={theme['c-button-font']} />
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    // paddingVertical: 8,
    gap: 22,
    // backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  queueWrap: {
    position: 'absolute',
    right: 0,
  },
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
    // marginLeft: 10,
  },
})

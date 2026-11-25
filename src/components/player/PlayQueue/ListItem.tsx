import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { scaleSizeH } from '@/utils/pixelRatio'

export const ITEM_HEIGHT = scaleSizeH(68)

export const ListItemEmpty = ({ label }: { label: string }) => {
  const theme = useTheme()
  return (
    <View style={styles.empty}>
      <Text color={theme['c-font-label']}>{label}</Text>
    </View>
  )
}

export default memo(({ item, index, isActive, onPress }: {
  item: LX.Music.MusicInfo
  index: number
  isActive: boolean
  onPress: (index: number) => void
}) => {
  const theme = useTheme()
  return (
    <View style={{ ...styles.listItem, backgroundColor: isActive ? theme['c-primary-alpha-700'] : 'rgba(0,0,0,0)' }}>
      { isActive ? <View style={{ ...styles.activeBar, backgroundColor: theme['c-primary'] }} /> : null }
      <TouchableOpacity style={styles.content} activeOpacity={0.7} onPress={() => { onPress(index) }}>
        <View style={styles.sn}>
          {
            isActive
              ? <Icon name="play-outline" size={12} color={theme['c-primary-font']} />
              : <Text size={12} color={theme['c-300']}>{index + 1}</Text>
          }
        </View>
        <Image url={item.meta.picUrl} style={styles.albumPic} />
        <View style={styles.info}>
          <Text size={14} color={isActive ? theme['c-primary-font'] : undefined} numberOfLines={1}>{item.name}</Text>
          <Text size={11} color={isActive ? theme['c-primary-alpha-400'] : theme['c-500']} numberOfLines={1}>{item.singer}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}, (prevProps, nextProps) => {
  return prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.isActive === nextProps.isActive
})

const styles = createStyle({
  listItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 16,
  },
  // 专辑封面，与歌曲列表保持一致
  albumPic: {
    width: scaleSizeH(50),
    height: scaleSizeH(50),
    borderRadius: 5,
    marginRight: scaleSizeH(8),
  },
  sn: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 4,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
})

import { forwardRef, useImperativeHandle, useRef, useMemo, useState, useEffect } from 'react'
import { FlatList } from 'react-native'

import Popup, { type PopupType, type PopupProps } from '@/components/common/Popup'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { usePlayInfo } from '@/store/player/hook'
import playerState from '@/store/player/state'
import listState from '@/store/list/state'
import { LIST_IDS } from '@/config/constant'
import { playList } from '@/core/player/player'
import { getListMusicSync, getListMusics } from '@/utils/listManage'
import { useUnmounted } from '@/utils/hooks'
import ListItem, { ITEM_HEIGHT, ListItemEmpty } from './ListItem'

export interface PlayQueueType {
  show: () => void
}

export interface PlayQueueProps extends Omit<PopupProps, 'children'> {}

// 队列列表标识与名称的映射，用于显示“临时列表”来源
const getTempListName = (id: string) => {
  if (!id) return ''
  if (id.startsWith('search__')) return global.i18n.t('play_queue_search')
  if (id.startsWith('board__')) return global.i18n.t('play_queue_leaderboard')
  if (id.startsWith('songlist__') || /^[a-z]+__/.test(id)) return global.i18n.t('play_queue_songlist')
  return ''
}

export default forwardRef<PlayQueueType, PlayQueueProps>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const t = useI18n()
  const theme = useTheme()
  const popupRef = useRef<PopupType>(null)
  const playInfo = usePlayInfo()
  const isUnmountedRef = useUnmounted()

  const queueId = playInfo.playerListId
  const currentIndex = playInfo.playerPlayIndex

  // 队列名称
  const queueName = useMemo(() => {
    if (!queueId) return ''
    switch (queueId) {
      case LIST_IDS.DEFAULT:
        return listState.defaultList.name
      case LIST_IDS.LOVE:
        return listState.loveList.name
      case LIST_IDS.TEMP:
        return getTempListName(listState.tempListMeta.id) || listState.tempList.name
      default: {
        const target = listState.userList.find(l => l.id == queueId)
        return target?.name ?? ''
      }
    }
  }, [queueId])

  // 队列歌曲：优先用内存缓存，未缓存时异步读取
  const [list, setList] = useState<LX.Music.MusicInfo[]>([])
  useEffect(() => {
    if (!queueId) {
      setList([])
      return
    }
    const cached = getListMusicSync(queueId)
    setList(cached)
    if (cached.length) return
    void getListMusics(queueId).then(musics => {
      if (isUnmountedRef.current) return
      if (playerState.playInfo.playerListId != queueId) return
      setList(musics)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId, playInfo.playerPlayIndex, visible])

  const handlePlay = (index: number) => {
    if (!queueId) return
    popupRef.current?.setVisible(false)
    void playList(queueId, index)
  }

  useImperativeHandle(ref, () => ({
    show() {
      if (visible) popupRef.current?.setVisible(true)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          popupRef.current?.setVisible(true)
        })
      }
    },
  }), [visible])

  if (!visible) return null

  const title = `${t('play_queue')}${queueName ? ` · ${queueName}` : ''}${list.length ? ` (${list.length})` : ''}`

  return (
    <Popup ref={popupRef} title={title} {...props}>
      <FlatList
        data={list}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        initialNumToRender={16}
        windowSize={10}
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        style={{ backgroundColor: theme['c-content-background'] }}
        ListEmptyComponent={(
          <ListItemEmpty label={t('play_queue_empty')} />
        )}
        renderItem={({ item, index }) => (
          <ListItem
            item={item}
            index={index}
            isActive={index == currentIndex}
            onPress={handlePlay}
          />
        )}
      />
    </Popup>
  )
})

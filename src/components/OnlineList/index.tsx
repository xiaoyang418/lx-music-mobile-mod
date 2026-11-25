import { useRef, forwardRef, useImperativeHandle } from 'react'
import { View, TouchableOpacity } from 'react-native'
// import LoadingMask, { LoadingMaskType } from '@/components/common/LoadingMask'
import List, { type ListProps, type ListType, type Status, type RowInfoType } from './List'
import ListMenu, { type ListMenuType, type Position, type SelectInfo } from './ListMenu'
import ListMusicMultiAdd, { type MusicMultiAddModalType as ListAddMultiType } from '@/components/MusicMultiAddModal'
import ListMusicAdd, { type MusicAddModalType as ListMusicAddType } from '@/components/MusicAddModal'
import MultipleModeBar, { type MultipleModeBarType, type SelectMode } from './MultipleModeBar'
import { clearMusicUrl, handleDislikeMusic, handlePlay, handlePlayLater, handlePlayList, handleShare, handleShowMusicSourceDetail } from './listAction'
import { createStyle } from '@/utils/tools'
import { usePlayMusicInfo } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { useI18n } from '@/lang'
import { scaleSizeW } from '@/utils/pixelRatio'

export interface OnlineListProps {
  onRefresh: ListProps['onRefresh']
  onLoadMore: ListProps['onLoadMore']
  onPlayList?: ListProps['onPlayList']
  progressViewOffset?: ListProps['progressViewOffset']
  ListHeaderComponent?: ListProps['ListHeaderComponent']
  checkHomePagerIdle?: boolean
  rowType?: RowInfoType
}
export interface OnlineListType {
  setList: (list: LX.Music.MusicInfoOnline[], isAppend?: boolean, showSource?: boolean) => void
  setStatus: (val: Status) => void
  getList: () => LX.Music.MusicInfoOnline[]
}

export default forwardRef<OnlineListType, OnlineListProps>(({
  onRefresh,
  onLoadMore,
  onPlayList,
  progressViewOffset,
  ListHeaderComponent,
  checkHomePagerIdle = false,
  rowType,
}, ref) => {
  const listRef = useRef<ListType>(null)
  const multipleModeBarRef = useRef<MultipleModeBarType>(null)
  const listMusicAddRef = useRef<ListMusicAddType>(null)
  const listMusicMultiAddRef = useRef<ListAddMultiType>(null)
  const listMenuRef = useRef<ListMenuType>(null)
  // const loadingMaskRef = useRef<LoadingMaskType>(null)
  const theme = useTheme()
  const t = useI18n()
  const playMusicInfo = usePlayMusicInfo()
  const hasPlayingMusic = !!playMusicInfo.musicInfo

  const handleLocatePlaying = () => {
    listRef.current?.scrollToActive()
  }

  useImperativeHandle(ref, () => ({
    setList(list, isAppend = false, showSource = false) {
      listRef.current?.setList(list, isAppend, showSource)
      multipleModeBarRef.current?.setIsSelectAll(false)
    },
    setStatus(val) {
      listRef.current?.setStatus(val)
    },
    getList() {
      return listRef.current?.getList() ?? []
    },
  }))

  const hancelMultiSelect = () => {
    multipleModeBarRef.current?.show()
    listRef.current?.setIsMultiSelectMode(true)
  }
  const hancelSwitchSelectMode = (mode: SelectMode) => {
    multipleModeBarRef.current?.setSwitchMode(mode)
    listRef.current?.setSelectMode(mode)
  }
  const hancelExitSelect = () => {
    multipleModeBarRef.current?.exitSelectMode()
    listRef.current?.setIsMultiSelectMode(false)
  }

  const showMenu = (musicInfo: LX.Music.MusicInfoOnline, index: number, position: Position) => {
    listMenuRef.current?.show({
      musicInfo,
      index,
      single: false,
      selectedList: listRef.current!.getSelectedList(),
    }, position)
  }
  const handleAddMusic = (info: SelectInfo) => {
    if (info.selectedList.length) {
      listMusicMultiAddRef.current?.show({ selectedList: info.selectedList, listId: '', isMove: false })
    } else {
      listMusicAddRef.current?.show({ musicInfo: info.musicInfo, listId: '', isMove: false })
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <List
          ref={listRef}
          onShowMenu={showMenu}
          onMuiltSelectMode={hancelMultiSelect}
          onSelectAll={isAll => multipleModeBarRef.current?.setIsSelectAll(isAll)}
          onRefresh={onRefresh}
          onLoadMore={onLoadMore}
          onPlayList={onPlayList ?? (index => { void handlePlayList(listRef.current?.getList() ?? [], index) })}
          progressViewOffset={progressViewOffset}
          ListHeaderComponent={ListHeaderComponent}
          checkHomePagerIdle={checkHomePagerIdle}
          rowType={rowType}
        />
        <MultipleModeBar
          ref={multipleModeBarRef}
          onSwitchMode={hancelSwitchSelectMode}
          onSelectAll={isAll => listRef.current?.selectAll(isAll)}
          onExitSelectMode={hancelExitSelect}
        />
      </View>
      {
        hasPlayingMusic
          ? (
            <TouchableOpacity
              style={{ ...styles.locateBtn, backgroundColor: theme['c-content-background'] }}
              activeOpacity={0.7}
              accessibilityLabel={t('play_locate_playing')}
              onPress={handleLocatePlaying}
            >
              <Icon name="search-2" color={theme['c-primary-font']} size={18} />
            </TouchableOpacity>
            )
          : null
      }
      <ListMusicAdd ref={listMusicAddRef} onAdded={() => { hancelExitSelect() }} />
      <ListMusicMultiAdd ref={listMusicMultiAddRef} onAdded={() => { hancelExitSelect() }} />
      <ListMenu
        ref={listMenuRef}
        onPlay={info => { handlePlay(info.musicInfo) }}
        onPlayLater={info => { hancelExitSelect(); handlePlayLater(info.musicInfo, info.selectedList, hancelExitSelect) }}
        onCopyName={info => { handleShare(info.musicInfo) }}
        onAdd={handleAddMusic}
        onMusicSourceDetail={info => { void handleShowMusicSourceDetail(info.musicInfo) }}
        onRemoveCache={info => { void clearMusicUrl(info.musicInfo) }}
        onDislikeMusic={info => { void handleDislikeMusic(info.musicInfo) }}
      />
      {/* <LoadingMask ref={loadingMaskRef} /> */}
    </View>
  )
})


const LOCATE_BTN_SIZE = scaleSizeW(38)

const styles = createStyle({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  // 右下角：定位当前播放
  locateBtn: {
    position: 'absolute',
    right: scaleSizeW(12),
    bottom: scaleSizeW(12),
    width: LOCATE_BTN_SIZE,
    height: LOCATE_BTN_SIZE,
    borderRadius: LOCATE_BTN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    opacity: 0.9,
  },
  list: {
    flex: 1,
  },
  exitMultipleModeBtn: {
    height: 40,
  },
})


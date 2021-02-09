//  消息提醒
import { ElMessage } from 'element-plus';
//  vue响应式模块
import { reactive } from 'vue';
//  剪贴板模块及类型
import { clipboard, nativeImage } from 'electron';
//  剪贴板观察者
import clipboardObserver from '@/utils/clipboardObserver';
//  剪贴板数据库
import clipboardDB from '@/dataBase/clipboard';
//  接口
import { ClipboardItem } from '../interface';

const state: {
  clipboardList: Array<ClipboardItem>;
} = reactive({
  clipboardList: []
});

//  从列表中复制出的内容
let copyFromList: any;

/**
 * 获取剪贴板记录列表
 */
function getAllClipboardList() {
  clipboardDB._db
    ?.find({})
    .sort({ createdAt: -1 })
    .exec((e, d) => {
      state.clipboardList = d as ClipboardItem[];
    });
}

/**
 * 剪贴板记录列表插入新数据
 * @param clipboardItem
 */
async function insertClipboardList(clipboardItem: ClipboardItem) {
  const result = await clipboardDB.insert(clipboardItem);
  return result;
}

/**
 * 剪贴板新增剪贴项
 * @param value
 * @param type
 */
async function clipboardListAdd(value: any, type: string) {
  const newestCopy = state.clipboardList[0];
  //  与最新复制的内容不同
  const isDiffNewest = newestCopy ? newestCopy.type !== type || newestCopy.value !== value : true;
  //  与上一个从列表复制的内容不同
  const isDiffCopyFromList = value !== copyFromList;

  if (isDiffNewest && isDiffCopyFromList) {
    if (type === 'image') {
      value = value.toDataURL();
    }

    const clipboardItem: ClipboardItem = {
      value,
      type,
      star: false
    };

    const result = await insertClipboardList(clipboardItem);
    state.clipboardList.unshift(result);
  }
}

/**
 * 剪贴板数据库移除某项
 * @param clipboardItem
 */
async function removeClipboardList(query: any) {
  const result = await clipboardDB.remove(query);
  return result;
}

/**
 * 点击删除按钮
 * @param row
 */
function del(row: any, rowIndex: number) {
  state.clipboardList.splice(rowIndex, 1);
  removeClipboardList({ _id: row._id });
  ElMessage('删除成功');
}

/**
 * 点击行复制
 * @param row
 */
function copy(row: ClipboardItem) {
  const { value, type } = row;
  if (type === 'text') {
    clipboard.writeText(value);
  } else {
    clipboard.writeImage(nativeImage.createFromDataURL(value));
  }
  copyFromList = row.value;
  ElMessage('复制成功');
}

/**
 * 切换收藏
 * @param row
 */
function toggleStar(row: any) {
  row.star = !row.star;
  updateClipboardList(
    {
      _id: row._id
    },
    {
      star: row.star
    }
  );
  ElMessage(`${row.star ? '收藏' : '取消收藏'}成功`);
}

/**
 * 剪贴板数据库更新某项
 * @param clipboardItem
 */
async function updateClipboardList(query: any, options: any) {
  const result = await clipboardDB.update(query, options);
  return result;
}

//  观察剪贴板变化
clipboardObserver({
  textChange(value: string) {
    clipboardListAdd(value, 'text');
  },
  imageChange(value: string) {
    clipboardListAdd(value, 'image');
  }
});

export { getAllClipboardList, state, copy, del, toggleStar };

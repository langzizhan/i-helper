import { globalShortcut } from 'electron';
import windowService from '@/main/modules/window/window.service';
import appStorageService from '@/main/modules/appStorage/appStorage.service';

/**
 * 快捷键回调
 */
const shortcutCallBack = {
  open: () => {
    const mainWindow = windowService.mainWindow;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  }
};

class ShortcutKeyService {
  storageName = 'shortcutKey';

  shortcutKey = {};

  /**
   * 应用初始化时执行
   */
  appOnReady() {
    this.shortcutKey = appStorageService.getData(this.storageName);

    for (const i in this.shortcutKey) {
      globalShortcut.register(this.shortcutKey[i], shortcutCallBack[i]);
    }
  }

  /**
   * 注册应用储存初始化的数据
   */
  register() {
    return {
      [this.storageName]: {
        open: 'Ctrl+Space'
      }
    };
  }

  /**
   * 更新快捷键
   * @param type 按键操作类型
   * @param key 按键
   */
  shortcutKeyUpdate(type: string, key: string): boolean {
    //  注销之前的快捷键
    globalShortcut.unregister(this.shortcutKey[type]);
    //  注册最新的快捷键
    globalShortcut.register(key, shortcutCallBack[type]);

    //  注册成功
    if (globalShortcut.isRegistered(key)) {
      //  更新内存中的快捷键设置
      this.shortcutKey[type] = key;
      //  更新全局设置数据
      appStorageService.setData(`${this.storageName}.${type}`, key);
      return true;
    } else {
      return false;
    }
  }
}

export default new ShortcutKeyService();

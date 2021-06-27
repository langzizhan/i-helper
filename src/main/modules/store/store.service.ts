import * as pluginAPI from '@/main/api/plugin';
import path from 'path';
import fs from 'fs';
import pluginService from '../plugin/plugin.service';
import * as fsUtils from '@/main/utils/fs';

class StoreService {
  pluginList: Array<any> = [];
  //  插件ID/插件信息的映射对象
  storePluginKeyMap: { [propName: string]: any } = {};

  async appOnReady() {
    await this.getPluginList();
  }

  /**
   * 请求获取商店插件列表
   * @returns
   */
  async getPluginList() {
    this.pluginList = await pluginAPI.getPluginList();

    /**
     * 设置插件ID/插件信息的映射对象
     * {
     *  [插件id]: 插件对象
     * }
     */
    this.storePluginKeyMap = this.pluginList.reduce((prev, plugin) => {
      prev[plugin.id] = plugin;
      return prev;
    }, {});
  }

  /**
   * 获取插件信息
   * @param id
   * @returns
   */
  getPlugin(id: string) {
    return this.storePluginKeyMap[id];
  }

  /**
   * 插件下载
   * 1. 创建文件夹
   * 2. 下载压缩包
   * 3. 下载成功后，安装此压缩包
   * 4. 安装成功后，更新此插件的下载标记
   * @param id
   */
  async download(id: string) {
    const plugin = this.getPlugin(id);
    const pluginZipsPath = `${global.rootPath}\\pluginZips`;
    //  安全的创建文件夹
    await fsUtils.safeCreatedir(pluginZipsPath);

    const zipPath = path.resolve(pluginZipsPath, `${id}.zip`);
    const writer = fs.createWriteStream(zipPath);

    const data = await pluginAPI.downloadPlugin('https://' + plugin.fileUrl);

    const finish = () =>
      new Promise(resolve => {
        writer.on('finish', async () => {
          try {
            await pluginService.installPlugin(zipPath);
          } catch (error) {
            throw new Error(error);
          }

          resolve(true);
        });
      });

    data.pipe(writer);
    await finish();
  }
}

export default new StoreService();

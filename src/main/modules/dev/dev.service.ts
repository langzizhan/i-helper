import { ipcMain } from 'electron';
import devManage from './dev.controller';

//  获取开发者插件窗口
ipcMain.handle('dev-list-get', () => {
  return devManage.getPluginList();
});

//  新增开发者插件
ipcMain.handle('dev-plugin-add', (event, path) => {
  return devManage.addPlugin(path);
});

//  获取开发者插件详情
ipcMain.handle('dev-plugin-detail-get', (event, id) => {
  return devManage.getPlugin(id);
});

//  更新开发者插件
ipcMain.handle('dev-plugin-update', (event, id) => {
  return devManage.updatePluginByJson(id);
});

//  打包开发者插件
ipcMain.handle('dev-plugin-build', (event, id) => {
  return devManage.buildPlugin(id);
});

//  删除开发者插件
ipcMain.handle('dev-plugin-del', (event, id) => {
  return devManage.delPlugin(id);
});

//  发布开发者插件
ipcMain.handle('dev-plugin-publish', (event, id, desc) => {
  return devManage.publish(id, desc);
});
/**
 * 从 Pixso 导出图标的脚本
 * 
 * 使用方法：
 * 1. 在 Pixso 中选中图标，复制链接（包含 item-id）
 * 2. 将节点 ID 添加到下面的 iconNodeIds 对象中
 * 3. 运行: node scripts/export-icons.js
 */

// 图标节点 ID 映射
// 格式: { pixsoName: "item-id" }
const iconNodeIds = {
  // 功能图标
  "icon/setting": null,      // 需要提供节点 ID
  "icon/history": null,
  "icon/delete": null,
  "icon/plus": null,
  "icon/minus": null,
  "icon/location": null,
  "icon/save-image": null,
  "icon/save-board": null,
  "icon/close": null,
  "icon/share": null,
  "icon/left": null,
  
  // 分类图标 - default 版本
  "icon/livingroom": null,
  "icon/kitchen": null,
  "icon/bedroom": null,
  "icon/bathroom": null,
  "icon/diningroom": null,
  "icon/office": null,
  "icon/children'sroom": null,
  "icon/StudyRoom": null,
  "icon/balcony": null,
  "icon/gate": null,
  "icon/corridor": null,
};

// 输出路径映射
const outputPaths = {
  // 功能图标
  "icon/setting": "assets/icons/icon/setting.png",
  "icon/history": "assets/icons/icon/history.png",
  "icon/delete": "assets/icons/icon/delete.png",
  "icon/plus": "assets/icons/icon/plus.png",
  "icon/minus": "assets/icons/icon/minus.png",
  "icon/location": "assets/icons/icon/location.png",
  "icon/save-image": "assets/icons/icon/save-image.png",
  "icon/save-board": "assets/icons/icon/save-board.png",
  "icon/close": "assets/icons/icon/close.png",
  "icon/share": "assets/icons/icon/share.png",
  "icon/left": "assets/icons/icon/left.png",
  
  // 分类图标 - default
  "icon/livingroom": "assets/icons/nav/livingroom-default.png",
  "icon/kitchen": "assets/icons/nav/kitchen-default.png",
  "icon/bedroom": "assets/icons/nav/bedroom-default.png",
  "icon/bathroom": "assets/icons/nav/bathroom-default.png",
  "icon/diningroom": "assets/icons/nav/diningroom-default.png",
  "icon/office": "assets/icons/nav/office-default.png",
  "icon/children'sroom": "assets/icons/nav/childrensroom-default.png",
  "icon/StudyRoom": "assets/icons/nav/studyroom-default.png",
  "icon/balcony": "assets/icons/nav/balcony-default.png",
  "icon/gate": "assets/icons/nav/gate-default.png",
  "icon/corridor": "assets/icons/nav/corridor-default.png",
};

console.log("图标导出脚本");
console.log("请在 Pixso 中选中图标，复制链接（包含 item-id），然后更新 iconNodeIds 对象");
console.log("\n需要导出的图标：");
Object.keys(iconNodeIds).forEach(name => {
  console.log(`  - ${name}: ${iconNodeIds[name] || "需要提供节点 ID"}`);
});

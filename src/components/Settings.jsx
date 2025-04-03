import { db } from "../services/db";

export default function Settings() {
  const clearIndexedDB = () => {
    return new Promise((resolve, reject) => {
      // 获取所有数据库
      const databases = indexedDB.databases();

      databases.then((dbs) => {
        // 删除每个数据库
        const deletePromises = dbs.map((db) => {
          return new Promise((res, rej) => {
            const request = indexedDB.deleteDatabase(db.name);
            request.onsuccess = () => res();
            request.onerror = () => rej(request.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch((error) => reject(error));
      });
    });
  };

  const handleClearStorage = async () => {
    // 获取对话框元素
    const modal = document.getElementById("clear-data-modal");
    modal.showModal();
  };

  // 导出数据
  const handleExportData = async () => {
    try {
      // 从 IndexedDB 获取所有数据
      const categories = await db.categories.getAll();
      const dishes = await db.dishes.getAll();

      console.log("导出前的菜品数据:", dishes); // 添加日志

      // 创建导出对象
      const exportData = {
        categories,
        dishes,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      console.log("准备导出的数据:", exportData); // 添加日志

      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2);

      // 创建 Blob
      const blob = new Blob([jsonString], { type: "application/json" });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eatwhatnow-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出数据失败:", error);
      alert("导出数据失败，请稍后重试");
    }
  };

  // 导入数据
  const handleImportData = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log("解析的导入数据:", data); // 添加日志

          // 验证数据格式
          if (!data.categories || !data.dishes) {
            throw new Error("无效的数据格式");
          }

          // 检查菜品数据中的评论
          data.dishes.forEach((dish) => {
            console.log(`菜品 ${dish.name} 的评论:`, dish.comments);
          });

          // 显示确认对话框
          const modal = document.getElementById("import-data-modal");
          modal.showModal();

          // 存储数据以供确认后使用
          window._importData = data;
        } catch (error) {
          console.error("解析导入文件失败:", error);
          alert("导入文件格式错误，请确保是有效的备份文件");
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("导入数据失败:", error);
      alert("导入数据失败，请稍后重试");
    }
  };

  // 确认导入数据
  const confirmImport = async () => {
    try {
      const data = window._importData;
      if (!data) {
        throw new Error("没有找到要导入的数据");
      }

      // 验证数据格式
      if (!Array.isArray(data.categories) || !Array.isArray(data.dishes)) {
        throw new Error("数据格式无效：缺少必要的数据结构");
      }

      console.log("开始导入数据...");

      // 1. 先清空数据库
      await clearDatabase();

      // 2. 导入新数据
      await importData(data);

      console.log("数据导入完成");
      document.getElementById("import-data-modal").close();
      window.location.reload();
    } catch (error) {
      console.error("导入数据失败:", error);
      alert(`导入数据失败: ${error.message}`);
    }
  };

  // 清空数据库函数
  const clearDatabase = async () => {
    console.log("清空现有数据...");

    // 获取所有现有数据
    const existingCategories = await db.categories.getAll();
    const existingDishes = await db.dishes.getAll();

    // 删除所有菜品
    for (const dish of existingDishes) {
      await db.dishes.delete(dish.id);
    }

    // 删除所有分类（除了"未分类"）
    for (const category of existingCategories) {
      if (category.id !== 0) {
        // 保留"未分类"
        await db.categories.delete(category.id);
      }
    }
  };

  // 导入数据函数
  const importData = async (data) => {
    // 导入分类数据
    console.log(`导入 ${data.categories.length} 个分类...`);
    const categoryMap = new Map();
    for (const category of data.categories) {
      if (category.id !== 0) { // 跳过"未分类"
        const id = await db.categories.add({
          name: category.name,
          createdAt: category.createdAt || new Date().toISOString(),
        });
        categoryMap.set(category.id, id);
      }
    }

    // 导入菜品数据
    console.log(`导入 ${data.dishes.length} 个菜品...`);
    for (const dish of data.dishes) {
      console.log("正在导入菜品:", dish.name);
      console.log("原始评论数据:", JSON.stringify(dish.comments, null, 2));

      const dishData = {
        name: dish.name,
        categoryId: dish.categoryId ? categoryMap.get(dish.categoryId) || 0 : 0,
        location: dish.location || "",
        address: dish.address || "",
        rating: dish.rating || 0,
        comments: dish.comments || [], // 保留评论数据
        createdAt: dish.createdAt || new Date().toISOString(),
      };

      console.log("准备存入数据库的菜品数据:", JSON.stringify(dishData, null, 2));
      
      try {
        await db.dishes.update(dishData); // 使用 update 而不是 add
        console.log(`菜品 ${dish.name} 导入成功`);
      } catch (error) {
        console.error(`导入菜品 ${dish.name} 失败:`, error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mx-auto text-center">v1.0.0</h2>
      {/* 数据管理部分 */}
      <div className="bg-base-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">数据管理</h3>
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-grow">
            <h4 className="font-medium mb-2">数据备份与恢复</h4>
            <p className="text-sm text-base-content/70 mb-4">
              导出数据用于备份，或导入之前的备份数据进行恢复。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExportData}
                className="btn btn-primary btn-sm"
              >
                导出数据
              </button>
              <label className="btn btn-primary btn-sm">
                导入数据
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                  onClick={(e) => (e.target.value = null)}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="flex-grow">
            <h4 className="font-medium mb-2">清空本地数据</h4>
            <p className="text-sm text-base-content/70 mb-4">
              这将清空所有本地存储的数据，包括菜品、评论、设置等。此操作不可撤销。
            </p>
            <button
              onClick={handleClearStorage}
              className="btn btn-error btn-sm"
            >
              清空所有数据
            </button>
          </div>
        </div>
      </div>

      {/* 清空数据确认对话框 */}
      <dialog id="clear-data-modal" className="modal">
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-lg mb-4">⚠️ 确认清空数据</h3>
          <p className="py-4 text-base-content/80">
            确定要清空所有本地存储的数据吗？此操作不可撤销。
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">取消</button>
            </form>
            <button
              className="btn btn-error"
              onClick={async () => {
                try {
                  localStorage.clear();
                  await clearIndexedDB();
                  document.getElementById("clear-data-modal").close();
                  window.location.reload();
                } catch (error) {
                  console.error("清空数据时出错:", error);
                  alert("清空数据时出错，请稍后重试");
                }
              }}
            >
              确认清空
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>关闭</button>
        </form>
      </dialog>

      {/* 导入数据确认对话框 */}
      <dialog id="import-data-modal" className="modal">
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-lg mb-4">⚠️ 确认导入数据</h3>
          <p className="py-4 text-base-content/80">
            导入新数据将会清空当前所有数据，确定要继续吗？
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">取消</button>
            </form>
            <button className="btn btn-primary" onClick={confirmImport}>
              确认导入
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>关闭</button>
        </form>
      </dialog>
    </div>
  );
}

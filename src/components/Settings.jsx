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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mx-auto text-center">v1.0.0</h2>
      {/* 数据管理部分 */}
      <div className="bg-base-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">数据管理</h3>
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
    </div>
  );
}

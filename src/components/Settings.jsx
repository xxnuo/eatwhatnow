export default function Settings() {
  const clearIndexedDB = () => {
    return new Promise((resolve, reject) => {
      // 获取所有数据库
      const databases = indexedDB.databases();
      
      databases.then((dbs) => {
        // 删除每个数据库
        const deletePromises = dbs.map(db => {
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
    const modal = document.getElementById('clear-data-modal');
    modal.showModal();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">设置</h2>
      <div className="space-y-4">
        <div>
          <button
            onClick={handleClearStorage}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            清空所有数据
          </button>
          <p className="text-sm text-gray-500 mt-2">
            这将清空所有本地存储的数据，包括菜品、评论、设置等
          </p>
        </div>
      </div>

      {/* 清空数据确认对话框 */}
      <dialog id="clear-data-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">确认清空数据</h3>
          <p className="py-4">确定要清空所有本地存储的数据吗？此操作不可撤销。</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-outline mr-2">取消</button>
            </form>
            <button 
              className="btn btn-error" 
              onClick={async () => {
                try {
                  localStorage.clear();
                  await clearIndexedDB();
                  document.getElementById('clear-data-modal').close();
                  // alert('所有数据已清空，页面将刷新');
                  window.location.reload();
                } catch (error) {
                  console.error('清空数据时出错:', error);
                  alert('清空数据时出错，请稍后重试');
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

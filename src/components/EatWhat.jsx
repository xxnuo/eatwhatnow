import { useState, useEffect } from "react";
import { db } from "../services/db";
import FoodDetail from "./FoodDetail";
import FoodCard from "./FoodCard";

export default function EatWhat() {
  const [currentDish, setCurrentDish] = useState(null);
  const [allDishes, setAllDishes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayDish, setDisplayDish] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('eatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('eatHistory', JSON.stringify(history));
  }, [history]);

  // 加载所有菜品
  useEffect(() => {
    const loadDishes = async () => {
      try {
        const dishes = await db.dishes.getAll();
        setAllDishes(dishes);
      } catch (error) {
        console.error("加载菜品失败:", error);
      }
    };
    loadDishes();
  }, []);

  const handleSpin = () => {
    if (isSpinning || allDishes.length === 0) return;
    setIsSpinning(true);

    const animationDuration = 2000;
    const minInterval = 1;
    const maxInterval = 100;
    const startTime = Date.now();

    const spin = () => {
      const currentTime = Date.now() - startTime;
      const progress = currentTime / animationDuration;

      if (progress < 1) {
        const randomIndex = Math.floor(Math.random() * allDishes.length);
        setDisplayDish(allDishes[randomIndex]);

        const easeOut = progress;
        const nextInterval =
          minInterval + easeOut * (maxInterval - minInterval);

        setTimeout(spin, nextInterval);
      } else {
        // 如果当前已有显示的菜品，将其添加到历史记录
        if (currentDish) {
          setHistory((prev) => [
            {
              dish: currentDish,
              timestamp: new Date().toLocaleString(),
            },
            ...prev,
          ]);
        }

        // 设置新的当前菜品
        const finalIndex = Math.floor(Math.random() * allDishes.length);
        const selectedDish = allDishes[finalIndex];
        setCurrentDish(selectedDish);
        setDisplayDish(selectedDish);
        setIsSpinning(false);
      }
    };

    spin();
  };

  // 添加评论
  const handleAddComment = async (comment) => {
    try {
      await db.dishes.addComment(selectedDish.id, comment);

      // 重新加载菜品数据
      const updatedDish = await db.dishes.getById(selectedDish.id);
      setSelectedDish(updatedDish);
      setCurrentDish(updatedDish);
    } catch (error) {
      console.error("添加评论失败:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const dish = await db.dishes.getById(selectedDish.id);
      if (!dish) return;

      dish.comments = dish.comments.filter((c) => c.id !== commentId);
      const avgRating =
        dish.comments.length > 0
          ? dish.comments.reduce((sum, c) => sum + c.rating, 0) /
            dish.comments.length
          : 0;
      dish.rating = avgRating;

      await db.dishes.update(dish);

      // 更新状态
      const updatedDish = await db.dishes.getById(selectedDish.id);
      setSelectedDish(updatedDish);
      setCurrentDish(updatedDish);
    } catch (error) {
      console.error("删除评论失败:", error);
    }
  };

  const handleClearHistory = () => {
    setShowConfirm(true);
  };

  const handleClearHistoryConfirm = () => {
    setHistory([]);
    localStorage.removeItem('eatHistory');
    setShowConfirm(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 pt-8">
      <div className="w-full max-w-[360px] flex flex-col items-center space-y-6">
        {allDishes.length > 0 ? (
          <>
            <div
              className={`w-full text-center py-18 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-amber-900/30 dark:to-yellow-800/30 rounded-xl transition-transform duration-200
              ${isSpinning ? "scale-105" : "scale-100"}`}
            >
              <div
                className={`text-3xl sm:text-3xl font-bold text-orange-950 dark:text-yellow-400 transition-all duration-200
                ${isSpinning ? "transform scale-110" : ""}`}
              >
                {isSpinning ? displayDish?.name : currentDish?.name || "👇"}
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`mt-4 px-12 py-4 rounded-full text-white font-medium transition-all duration-300 transform text-lg
                ${
                  isSpinning
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed scale-95"
                    : "bg-orange-500 hover:bg-orange-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 hover:scale-105 active:scale-95"
                }`}
            >
              {isSpinning ? "🎲🎲🎲" : "🤤🤤🤤"}
            </button>

            {/* 显示当前菜品 */}
            {displayDish && (
              <div className="w-full mt-6">
                <FoodCard
                  dish={displayDish}
                  onClick={() => !isSpinning && setSelectedDish(displayDish)}
                  showActions={false}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-600 dark:text-yellow-200/80 px-4">
            <p className="text-xl font-bold mb-3">还没有添加任何菜品</p>
            <p className="text-gray-500 dark:text-yellow-200/60 text-sm">
              请先在"菜单"标签页添加一些菜品
            </p>
          </div>
        )}

        {/* 历史记录部分 */}
        {history.length > 0 && (
          <div className="w-full mt-6 pb-20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-yellow-200">
                历史记录
              </h3>
              <button
                onClick={handleClearHistory}
                className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                清除记录
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: "calc(100vh - 400px)",
              }}
            >
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index}>
                    <FoodCard
                      dish={item.dish}
                      onClick={() => !isSpinning && setSelectedDish(item.dish)}
                      showActions={false}
                    />
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 确认对话框 */}
        <dialog
          id="clear_confirm_modal"
          className={`modal ${showConfirm ? "modal-open" : ""}`}
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认清除</h3>
            <p className="py-4">确定要清除所有历史记录吗？</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowConfirm(false)}
              >
                取消
              </button>
              <button
                className="btn btn-error"
                onClick={handleClearHistoryConfirm}
              >
                确认清除
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowConfirm(false)}>关闭</button>
          </form>
        </dialog>

        {/* 添加菜品详情模态框 */}
        {selectedDish && (
          <FoodDetail
            dish={selectedDish}
            onClose={() => setSelectedDish(null)}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </div>
  );
}

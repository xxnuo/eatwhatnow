import { useState, useEffect } from "react";
import { db } from "../services/db";
import FoodDetail from "./FoodDetail";
import FoodCard from './FoodCard';

export default function EatWhat() {
  const [currentDish, setCurrentDish] = useState(null);
  const [allDishes, setAllDishes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayDish, setDisplayDish] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

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

    const animationDuration = 2000; // 总时长2秒
    const minInterval = 1;
    const maxInterval = 100; // 最慢速度
    const startTime = Date.now();

    const spin = () => {
      const currentTime = Date.now() - startTime;
      const progress = currentTime / animationDuration;

      if (progress < 1) {
        const randomIndex = Math.floor(Math.random() * allDishes.length);
        setDisplayDish(allDishes[randomIndex]);

        // 从最快速度开始，然后减速
        const easeOut = progress;
        const nextInterval =
          minInterval + easeOut * (maxInterval - minInterval);

        setTimeout(spin, nextInterval);
      } else {
        // 动画结束,选择最终结果
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

  return (
    <div className="h-screen flex flex-col items-center justify-start p-4 pt-8">
      <div className="w-full max-w-[360px] flex flex-col items-center space-y-6">
        {allDishes.length > 0 ? (
          <>
            <div
              className={`w-full text-center py-8 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-amber-900/30 dark:to-yellow-800/30 rounded-xl transition-transform duration-200
              ${isSpinning ? "scale-105" : "scale-100"}`}
            >
              <div
                className={`text-2xl sm:text-3xl font-bold text-orange-950 dark:text-yellow-400 transition-all duration-200
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

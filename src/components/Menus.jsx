import { useState, useEffect } from "react";
import { db } from "../services/db";
import { Link } from "react-router-dom";
import FoodDetail from "./FoodDetail";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  // 新增状态
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [isEditingDish, setIsEditingDish] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingDish, setEditingDish] = useState(null);

  // 新增分类管理状态
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  // 新增图片处理状态
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await db.categories.getAll();
        setCategories(cats);
      } catch (error) {
        console.error("加载分类失败:", error);
      }
    };
    loadCategories();
  }, []);

  // 加载菜品
  useEffect(() => {
    const loadDishes = async () => {
      try {
        const items = selectedCategory
          ? await db.dishes.getByCategory(selectedCategory.id)
          : await db.dishes.getAll();
        setDishes(items);
      } catch (error) {
        console.error("加载菜品失败:", error);
      }
    };
    loadDishes();
  }, [selectedCategory]);

  // 添加评论
  const handleAddComment = async (comment) => {
    try {
      await db.dishes.addComment(selectedDish.id, comment);

      // 重新加载菜品数据
      const updatedDish = await db.dishes.getById(selectedDish.id);
      setSelectedDish(updatedDish);

      // 更新菜品列表中的评分
      setDishes(
        dishes.map((dish) => (dish.id === updatedDish.id ? updatedDish : dish))
      );
    } catch (error) {
      console.error("添加评论失败:", error);
    }
  };

  // 修改删除评论的处理函数
  const handleDeleteComment = async (commentId) => {
    try {
      // 先获取当前菜品的副本
      const currentDish = { ...selectedDish };

      // 删除评论并获取更新后的菜品
      const updatedDish = await db.dishes.deleteComment(
        currentDish.id,
        commentId
      );

      // 只更新当前菜品在列表中的数据
      const updatedDishes = dishes.map((dish) =>
        dish.id === updatedDish.id ? updatedDish : dish
      );

      // 更新状态
      setDishes(updatedDishes);
      setSelectedDish(updatedDish);
    } catch (error) {
      console.error("删除评论失败:", error);
    }
  };

  // 新增处理函数
  const handleAddCategory = async (name) => {
    try {
      await db.categories.add({ name });
      const cats = await db.categories.getAll();
      setCategories(cats);
      setIsAddingCategory(false);
    } catch (error) {
      console.error("添加分类失败:", error);
    }
  };

  const handleEditCategory = async (id, name) => {
    try {
      await db.categories.update(id, { name });
      const cats = await db.categories.getAll();
      setCategories(cats);
      setIsEditingCategory(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("编辑分类失败:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // 1. 获取该分类下的所有菜品
      const allDishes = await db.dishes.getAll();
      const dishesToUpdate = allDishes.filter((dish) => dish.categoryId === id);

      // 2. 将这些菜品转移到未分类(id=0)
      for (const dish of dishesToUpdate) {
        await db.dishes.update({
          ...dish,
          categoryId: 0,
        });
      }

      // 3. 删除分类
      await db.categories.delete(id);

      // 4. 重新加载分类列表
      const cats = await db.categories.getAll();
      setCategories(cats);

      // 5. 如果当前选中的就是被删除的分类,切换到全部
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }

      // 6. 重新加载菜品列表
      const items = await db.dishes.getByCategory(
        selectedCategory?.id === id ? 0 : selectedCategory?.id
      );
      setDishes(items);
    } catch (error) {
      console.error("删除分类失败:", error);
    }
  };

  const handleAddDish = async (dishData) => {
    try {
      // 创建菜品数据
      const newDish = {
        name: dishData.name,
        categoryId: dishData.categoryId,
        location: dishData.location, 
        address: dishData.address,
        rating: 0,
        comments: [],
        createdAt: new Date().toISOString()
      };

      await db.dishes.add(newDish);
      const items = await db.dishes.getByCategory(selectedCategory?.id);
      setDishes(items);
      setIsAddingDish(false);
    } catch (error) {
      console.error("添加菜品失败:", error);
    }
  };

  const handleEditDish = async (id, dishData) => {
    try {
      // 获取原有菜品数据
      const originalDish = await db.dishes.getById(id);
      
      // 更新基本信息,保留原有评论和图片
      const updatedDish = {
        ...originalDish,
        name: dishData.name,
        categoryId: dishData.categoryId,
        location: dishData.location,
        address: dishData.address
      };

      await db.dishes.update(updatedDish);

      // 更新列表中的菜品
      const updatedDishes = dishes.map((dish) =>
        dish.id === id ? updatedDish : dish
      );
      setDishes(updatedDishes);

      setIsEditingDish(false);
      setEditingDish(null);
    } catch (error) {
      console.error("编辑菜品失败:", error);
    }
  };

  const handleDeleteDish = async (id) => {
    try {
      // 先删除菜品
      await db.dishes.delete(id);

      // 如果删除的是当前选中的菜品，清除选中状态
      if (selectedDish?.id === id) {
        setSelectedDish(null);
      }

      // 直接从当前列表中移除被删除的菜品
      const updatedDishes = dishes.filter((dish) => dish.id !== id);
      setDishes(updatedDishes);
    } catch (error) {
      console.error("删除菜品失败:", error);
    }
  };

  // 添加更新评论的处理函数
  const handleUpdateComment = async (dishId, commentId, updatedComment) => {
    try {
      const updatedDish = await db.dishes.updateComment(
        dishId,
        commentId,
        updatedComment
      );
      setSelectedDish(updatedDish);
      setDishes(
        dishes.map((dish) => (dish.id === updatedDish.id ? updatedDish : dish))
      );
    } catch (error) {
      console.error("更新评论失败:", error);
    }
  };

  // 修改图片处理函数
  const handleDishImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert("单个图片不能超过50MB");
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 搜索栏 */}
      <div className="sticky top-0 z-10 bg-base-100 p-4 shadow-sm">
        <div className="join w-full">
          <input
            type="text"
            placeholder="搜索菜品..."
            className="input input-bordered join-item flex-1"
          />
          <button className="btn join-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 主要内容区域 - 添加滚动容器 */}
      <div className="flex-1 overflow-y-auto">
        {/* 分类横向滚动 */}
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max items-center">
            {/* 单独渲染"全部"按钮 */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn btn-sm ${
                selectedCategory === null ? "btn-primary" : "btn-ghost"
              }`}
            >
              全部
            </button>
            {/* 渲染其他分类 */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`btn btn-sm ${
                  selectedCategory?.id === category.id
                    ? "btn-primary"
                    : "btn-ghost"
                }`}
              >
                {category.name}
              </button>
            ))}

            {/* 分类管理按钮 */}
            <button
              onClick={() => setIsManagingCategories(true)}
              className="btn btn-sm btn-ghost"
            >
              分类管理
            </button>
          </div>
        </div>

        {/* 菜品网格 */}
        <div className="p-4 grid grid-cols-1 gap-4 pb-24">
          {/* 添加菜品按钮 */}
          <button
            onClick={() => setIsAddingDish(true)}
            className="card card-compact bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-dashed border-base-300 p-4 flex items-center justify-center"
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>添加新菜品</span>
            </div>
          </button>

          {/* 菜品列表 */}
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="card card-compact bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div
                className="flex relative"
                onClick={(e) => {
                  if (!e.target.closest(".dish-menu")) {
                    setSelectedDish(dish);
                  }
                }}
              >
                {dish.comments?.[0]?.images?.[0] && (
                  <figure className="w-1/3">
                    <img
                      src={dish.comments[0].images[0]}
                      alt={dish.name}
                      className="h-full w-full object-cover"
                    />
                  </figure>
                )}
                <div className="card-body flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-lg">{dish.name}</h3>
                    <div className="dish-menu dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-sm btn-ghost btn-circle"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                      <ul
                        tabIndex={0}
                        className="dish-menu dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                      >
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDish(dish);
                              setIsEditingDish(true);
                            }}
                          >
                            编辑
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDish(dish.id);
                            }}
                            className="text-error"
                          >
                            删除
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm opacity-70">{dish.location}</p>
                  <div className="flex items-center gap-2">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          className="mask mask-star-2"
                          checked={Math.round(dish.rating) === star}
                          readOnly
                        />
                      ))}
                    </div>
                    <span className="text-sm opacity-70">
                      {dish.comments?.length || 0} 条评论
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类管理对话框 */}
      {isManagingCategories && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">分类管理</h3>

            {/* 添加分类按钮 */}
            <button
              onClick={() => setIsAddingCategory(true)}
              className="btn btn-sm btn-ghost text-primary mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              添加新分类
            </button>

            {/* 分类列表 */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>分类名称</th>
                    <th className="w-24">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories
                    .filter((cat) => cat.id !== 0)
                    .map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setIsEditingCategory(true);
                              }}
                              className="btn btn-xs btn-ghost"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="btn btn-xs btn-ghost text-error"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsManagingCategories(false)}
              >
                关闭
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setIsManagingCategories(false)}
          ></label>
        </div>
      )}

      {/* 添加分类模态框 */}
      {isAddingCategory && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">添加分类</h3>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">分类名称</span>
              </label>
              <input
                type="text"
                id="newCategoryName"
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const name = document.getElementById("newCategoryName").value;
                  if (name) handleAddCategory(name);
                }}
              >
                确定
              </button>
              <button
                className="btn"
                onClick={() => setIsAddingCategory(false)}
              >
                取消
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setIsAddingCategory(false)}
          ></label>
        </div>
      )}

      {/* 编辑分类模态框 */}
      {isEditingCategory && editingCategory && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">编辑分类</h3>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">分类名称</span>
              </label>
              <input
                type="text"
                id="editCategoryName"
                className="input input-bordered w-full"
                defaultValue={editingCategory.name}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const name =
                    document.getElementById("editCategoryName").value;
                  if (name) handleEditCategory(editingCategory.id, name);
                }}
              >
                确定
              </button>
              <button
                className="btn"
                onClick={() => {
                  setIsEditingCategory(false);
                  setEditingCategory(null);
                }}
              >
                取消
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => {
              setIsEditingCategory(false);
              setEditingCategory(null);
            }}
          ></label>
        </div>
      )}

      {/* 添加菜品模态框 */}
      {isAddingDish && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">添加菜品</h3>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">菜品名称</span>
              </label>
              <input
                type="text"
                id="newDishName"
                className="input input-bordered w-full"
              />

              <label className="label">
                <span className="label-text">所属分类</span>
              </label>
              <select
                id="newDishCategory"
                className="select select-bordered w-full"
              >
                {categories
                  .filter((c) => c.id !== 0)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <label className="label">
                <span className="label-text">餐厅名称</span>
              </label>
              <input
                type="text"
                id="newDishLocation"
                className="input input-bordered w-full"
              />

              <label className="label">
                <span className="label-text">餐厅地址</span>
              </label>
              <input
                type="text"
                id="newDishAddress"
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const name = document.getElementById("newDishName").value;
                  const categoryId = parseInt(
                    document.getElementById("newDishCategory").value
                  );
                  const location =
                    document.getElementById("newDishLocation").value;
                  const address =
                    document.getElementById("newDishAddress").value;

                  if (name && location && address) {
                    handleAddDish({
                      name,
                      categoryId,
                      location,
                      address
                    });
                  }
                }}
              >
                确定
              </button>
              <button
                className="btn"
                onClick={() => setIsAddingDish(false)}
              >
                取消
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setIsAddingDish(false)}
          ></label>
        </div>
      )}

      {/* 编辑菜品模态框 */}
      {isEditingDish && editingDish && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">编辑菜品</h3>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">菜品名称</span>
              </label>
              <input
                type="text"
                id="editDishName"
                className="input input-bordered w-full"
                defaultValue={editingDish.name}
              />

              <label className="label">
                <span className="label-text">所属分类</span>
              </label>
              <select
                id="editDishCategory"
                className="select select-bordered w-full"
                defaultValue={editingDish.categoryId}
              >
                {categories
                  .filter((c) => c.id !== 0)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <label className="label">
                <span className="label-text">餐厅名称</span>
              </label>
              <input
                type="text"
                id="editDishLocation"
                className="input input-bordered w-full"
                defaultValue={editingDish.location}
              />

              <label className="label">
                <span className="label-text">餐厅地址</span>
              </label>
              <input
                type="text"
                id="editDishAddress"
                className="input input-bordered w-full"
                defaultValue={editingDish.address}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const name = document.getElementById("editDishName").value;
                  const categoryId = parseInt(
                    document.getElementById("editDishCategory").value
                  );
                  const location =
                    document.getElementById("editDishLocation").value;
                  const address =
                    document.getElementById("editDishAddress").value;

                  if (name && location && address) {
                    handleEditDish(editingDish.id, {
                      name,
                      categoryId,
                      location,
                      address
                    });
                  }
                }}
              >
                确定
              </button>
              <button
                className="btn"
                onClick={() => {
                  setIsEditingDish(false);
                  setEditingDish(null);
                }}
              >
                取消
              </button>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => {
              setIsEditingDish(false);
              setEditingDish(null);
            }}
          ></label>
        </div>
      )}

      {/* 添加菜品详情模态框 */}
      {selectedDish && (
        <FoodDetail
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onUpdateComment={handleUpdateComment}
        />
      )}
    </div>
  );
}

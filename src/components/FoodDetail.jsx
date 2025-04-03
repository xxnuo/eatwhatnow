import { useState } from "react";

// 修改 ImageGallery 组件
const ImageGallery = ({ images, onClose }) => {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer"
            onClick={() => setActiveImage(image)}
          >
            <img
              src={image}
              alt={`图片 ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* 图片预览模态框 */}
      {activeImage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl p-0 bg-transparent">
            <img
              src={activeImage}
              alt="预览图片"
              className="w-full h-full object-contain"
            />
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setActiveImage(null)}
          ></label>
        </div>
      )}
    </>
  );
};

export default function FoodDetail({
  dish,
  onClose,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
}) {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [editingComment, setEditingComment] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // 改为数组
  const [previewImages, setPreviewImages] = useState([]); // 改为数组

  const handleImageChange = (e) => {
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

  const handleSubmitComment = async () => {
    // 修改验证逻辑 - 内容和图片至少要有一个
    if (!newComment.trim() && imageFiles.length === 0) {
      alert("评论内容和图片至少需要填写一个");
      return;
    }

    let imageDataArray = [];
    if (imageFiles.length > 0) {
      // 确保所有图片都被正确处理
      imageDataArray = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            })
        )
      );
    }

    if (editingComment) {
      // 编辑评论时的处理
      const combinedImages = [
        ...(editingComment.images || []), // 保留原有的图片
        ...imageDataArray, // 添加新上传的图片
      ];

      await onUpdateComment(dish.id, editingComment.id, {
        content: newComment.trim(),
        rating,
        images: combinedImages,
      });
      setEditingComment(null);
    } else {
      // 新增评论时的处理
      await onAddComment({
        content: newComment.trim(),
        rating,
        images: imageDataArray,
      });
    }

    // 重置表单
    setNewComment("");
    setRating(5);
    setImageFiles([]);
    setPreviewImages([]);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    setRating(comment.rating);
    setPreviewImages(comment.images || []);
    // 重要：不要设置 imageFiles，因为我们不需要重新上传已有的图片
    setImageFiles([]);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl bg-base-200">
        {/* 头部区域 */}
        <div className="bg-base-100 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-between">
            {dish.name}
            <div className="flex items-center gap-2">
              <span className="text-3xl text-yellow-400">⭐</span>
              <span className="text-2xl font-bold">
                {dish.rating.toFixed(1)}
              </span>
            </div>
          </h3>

          {/* 菜品图片 */}
          {dish.photo && (
            <div className="mb-4">
              <img
                src={dish.photo}
                alt={dish.name}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-base-content/70">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{dish.location}</span>
            <span className="mx-2">·</span>
            <span className="text-sm">{dish.address}</span>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-bold flex items-center gap-2">
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            评论 ({dish.comments?.length || 0})
          </h4>

          {dish.comments?.map((comment) => (
            <div
              key={comment.id}
              className="bg-base-100 p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        className="mask mask-star-2 bg-yellow-400"
                        checked={comment.rating === star}
                        readOnly
                      />
                    ))}
                  </div>
                  <p className="text-sm text-base-content/60">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleEditComment(comment)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <p className="text-base-content/80 mb-3">{comment.content}</p>

              {comment.images?.length > 0 && (
                <div className="mt-3">
                  <ImageGallery images={comment.images} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 添加评论表单 */}
        <div className="bg-base-100 rounded-lg p-6">
          <div className="flex flex-col gap-4">
            {/* 图片上传区域 */}
            <div className="flex items-center gap-4">
              <label className="btn btn-outline gap-2 flex-1">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
                添加图片
              </label>

              <div className="rating rating-md">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name="rating"
                    className="mask mask-star-2 bg-amber-400 dark:bg-amber-500"
                    checked={rating === star}
                    onChange={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* 预览图片区域 */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`预览图片 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      className="btn btn-circle btn-sm absolute -top-2 -right-2 bg-base-100"
                      onClick={() => {
                        setImageFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setPreviewImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 评论文本区域 */}
            <textarea
              className="textarea textarea-bordered w-full min-h-[100px]"
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            {/* 操作按钮区域 */}
            <div className="flex justify-end gap-2">
              {editingComment && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingComment(null);
                    setNewComment("");
                    setRating(5);
                    setImageFiles([]);
                    setPreviewImages([]);
                  }}
                >
                  取消
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() && previewImages.length === 0}
              >
                {editingComment ? "更新评论" : "发表评论"}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost gap-2" onClick={onClose}>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            关闭
          </button>
        </div>
      </div>
      <label className="modal-backdrop" onClick={onClose}></label>
    </div>
  );
}

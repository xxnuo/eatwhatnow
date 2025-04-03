import { useState } from 'react';

export default function FoodDetail({ dish, onClose, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [commentImage, setCommentImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment({
        content: newComment,
        rating,
        image: commentImage
      });
      setNewComment('');
      setRating(5);
      setCommentImage(null);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg flex items-center justify-between">
          {dish.name}
          <span className="badge badge-lg">
            {dish.rating.toFixed(1)}⭐
          </span>
        </h3>

        {/* 菜品图片 */}
        {dish.photo && (
          <div className="mt-4">
            <img
              src={dish.photo}
              alt={dish.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <p className="py-4">
          <span className="font-bold">位置：</span>
          {dish.location} ({dish.address})
        </p>

        {/* 评论列表 */}
        <div className="divider">评论</div>
        <div className="space-y-4">
          {dish.comments?.map((comment) => (
            <div key={comment.id} className="bg-base-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      className="mask mask-star-2"
                      checked={comment.rating === star}
                      readOnly
                    />
                  ))}
                </div>
                <span className="text-sm opacity-50">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              {comment.image && (
                <div className="mt-2">
                  <img
                    src={comment.image}
                    alt="评论图片"
                    className="w-full max-h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="mt-2">{comment.content}</p>
            </div>
          ))}
        </div>

        {/* 添加评论 */}
        <div className="mt-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="写下你的评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex items-center gap-4 mt-2">
            <div className="rating rating-md">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating"
                  className="mask mask-star-2"
                  checked={rating === star}
                  onChange={() => setRating(star)}
                />
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-sm w-full max-w-xs"
              onChange={handleImageChange}
            />
            <button
              className="btn btn-primary"
              onClick={handleSubmitComment}
            >
              发表评论
            </button>
          </div>
          {commentImage && (
            <div className="mt-2">
              <img
                src={commentImage}
                alt="预览图片"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
      <label className="modal-backdrop" onClick={onClose}></label>
    </div>
  );
}

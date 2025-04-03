import React from 'react';

export default function FoodCard({ dish, onClick, onEdit, onDelete, showActions = true }) {
  return (
    <div className="card card-compact bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div
        className="flex relative"
        onClick={(e) => {
          if (!e.target.closest(".dish-menu")) {
            onClick?.(dish);
          }
        }}
      >
        {dish.comments?.some(comment => comment.images?.length > 0) && (
          <figure className="w-1/3">
            <img
              src={dish.comments.find(comment => comment.images?.length > 0).images[0]}
              alt={dish.name}
              className="h-full w-full object-cover"
            />
          </figure>
        )}
        <div className="card-body flex-1">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-lg">{dish.name}</h3>
            {showActions && (
              <div className="dish-menu dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-sm btn-ghost btn-circle">
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
                <ul tabIndex={0} className="dish-menu dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                  <li>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(dish);
                    }}>
                      编辑
                    </button>
                  </li>
                  <li>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(dish.id);
                    }} className="text-error">
                      删除
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <p className="text-sm opacity-70">{dish.location}</p>
          <div className="flex items-center gap-2">
            <div className="rating rating-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  className="mask mask-star-2 bg-amber-400 dark:bg-amber-500"
                  checked={star === Math.ceil(dish.rating)}
                  readOnly
                />
              ))}
            </div>
            <span className="text-sm opacity-70">
              {dish.rating.toFixed(1)} · {dish.comments?.length || 0} 条评论
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

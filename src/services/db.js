const DB_NAME = 'EatWhatDB';
const DB_VERSION = 2;  // 增加版本号以触发数据库升级

// 数据库结构
const DB_STORES = {
  categories: 'categories',
  dishes: 'dishes'
};

// 初始化数据
const initialCategories = [
  { id: 0, name: "未分类" },
  { id: 1, name: "家常菜" },
  { id: 2, name: "川湘菜" },
  { id: 3, name: "粤菜" },
  { id: 4, name: "面食饺子" },
  { id: 5, name: "快餐便当" },
  { id: 6, name: "火锅串串" },
  { id: 7, name: "烧烤夜宵" },
  { id: 8, name: "早点小吃" }
];

const initialDishes = [
  {
    id: 1,
    name: "红烧肉",
    categoryId: 1,
    location: "老王饭店", 
    address: "幸福路123号",
    photo: null,
    rating: 4.5,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 1,
        content: "非常好吃，肥而不腻",
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 2,
    name: "麻婆豆腐",
    categoryId: 2,
    location: "川香园",
    address: "和平路45号",
    photo: null,
    rating: 4.8,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 2,
        content: "麻辣鲜香，味道地道",
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 3,
    name: "白切鸡",
    categoryId: 3,
    location: "粤味轩",
    address: "广场路67号",
    photo: null,
    rating: 4.6,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 3,
        content: "皮滑肉嫩，配上姜葱酱简直绝配",
        rating: 4,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 4,
    name: "牛肉拉面",
    categoryId: 4,
    location: "兰州拉面",
    address: "民主路89号",
    photo: null,
    rating: 4.7,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 4,
        content: "面条劲道，汤头浓郁",
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 5,
    name: "黄焖鸡米饭",
    categoryId: 5,
    location: "快客便当",
    address: "学院路234号",
    photo: null,
    rating: 4.3,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 5,
        content: "分量足，性价比高",
        rating: 4,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 6,
    name: "毛血旺",
    categoryId: 6,
    location: "老火锅",
    address: "重庆路56号",
    photo: null,
    rating: 4.9,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 6,
        content: "麻辣过瘾，服务态度好",
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// 打开数据库连接
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 创建分类表
      if (!db.objectStoreNames.contains(DB_STORES.categories)) {
        const categoryStore = db.createObjectStore(DB_STORES.categories, { keyPath: 'id', autoIncrement: true });
        categoryStore.createIndex('name', 'name', { unique: true });
        
        // 添加初始分类数据
        initialCategories.forEach(category => {
          categoryStore.add(category);
        });
      }

      // 创建菜品表
      if (!db.objectStoreNames.contains(DB_STORES.dishes)) {
        const dishStore = db.createObjectStore(DB_STORES.dishes, { keyPath: 'id', autoIncrement: true });
        dishStore.createIndex('name', 'name', { unique: false });
        dishStore.createIndex('categoryId', 'categoryId', { unique: false });
        dishStore.createIndex('rating', 'rating', { unique: false });
        
        // 添加初始菜品数据
        initialDishes.forEach(dish => {
          dishStore.add(dish);
        });
      }

      // 如果存在旧的评论表，则删除它
      if (db.objectStoreNames.contains('comments')) {
        db.deleteObjectStore('comments');
      }
    };
  });
};

// 通用的数据库操作方法
const dbOperation = async (storeName, mode, operation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    
    const request = operation(store);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// 导出数据库操作方法
export const db = {
  // 分类操作
  categories: {
    getAll: () => dbOperation(DB_STORES.categories, 'readonly', store => store.getAll()),
    add: (category) => dbOperation(DB_STORES.categories, 'readwrite', store => store.add(category)),
    update: (category) => dbOperation(DB_STORES.categories, 'readwrite', store => store.put(category)),
    delete: (id) => dbOperation(DB_STORES.categories, 'readwrite', store => store.delete(id))
  },
  
  // 菜品操作
  dishes: {
    getAll: () => dbOperation(DB_STORES.dishes, 'readonly', store => store.getAll()),
    getByCategory: async (categoryId) => {
      const all = await dbOperation(DB_STORES.dishes, 'readonly', store => store.getAll());
      return categoryId !== null ? all.filter(dish => dish.categoryId === categoryId) : all;
    },
    add: (dish) => dbOperation(DB_STORES.dishes, 'readwrite', store => store.add({
      ...dish,
      comments: []
    })),
    update: (dish) => dbOperation(DB_STORES.dishes, 'readwrite', store => store.put(dish)),
    delete: (id) => dbOperation(DB_STORES.dishes, 'readwrite', store => store.delete(id)),
    getById: (id) => dbOperation(DB_STORES.dishes, 'readonly', store => store.get(id)),
    
    // 评论相关操作
    addComment: async (dishId, comment) => {
      const dish = await db.dishes.getById(dishId);
      if (!dish) throw new Error('菜品不存在');
      
      const newComment = {
        id: Date.now(), // 使用时间戳作为评论ID
        ...comment,
        createdAt: new Date().toISOString()
      };
      
      dish.comments = dish.comments || [];
      dish.comments.push(newComment);
      
      // 更新菜品评分
      const avgRating = dish.comments.reduce((sum, c) => sum + c.rating, 0) / dish.comments.length;
      dish.rating = avgRating;
      
      return db.dishes.update(dish);
    },
    getComments: async (dishId) => {
      const dish = await db.dishes.getById(dishId);
      return dish ? (dish.comments || []) : [];
    }
  }
}; 
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import "./App.css";
import EatWhat from "./components/EatWhat";
import Menu from "./components/Menus";
import Settings from "./components/Settings";

function App() {
  const [theme, setTheme] = useState("system");
  const location = useLocation();

  useEffect(() => {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.setAttribute(
          "data-theme",
          mediaQuery.matches ? "dark" : "light"
        );
      }
    };

    // 初始化主题
    if (theme === "system") {
      document.documentElement.setAttribute(
        "data-theme",
        mediaQuery.matches ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme !== "system") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/eat":
        return "吃啥";
      case "/menu":
        return "菜单";
      case "/settings":
        return "设置";
      default:
        return "吃啥";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* 顶部标题栏 - 修改为居中布局 */}
      <div className="navbar bg-base-100 shadow-sm px-4">
        {/* 左侧占位 */}
        <div className="flex-1">
          <div className="w-10"></div> {/* 与右侧主题按钮宽度相同的占位 */}
        </div>
        {/* 居中标题 */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>
        {/* 右侧主题切换按钮 */}
        <div className="flex-1 flex justify-end">
          <button
            className="btn btn-circle btn-ghost w-10"
            onClick={() => {
              const nextTheme =
                theme === "light"
                  ? "dark"
                  : theme === "dark"
                  ? "system"
                  : "light";
              handleThemeChange(nextTheme);
            }}
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<EatWhat />} />
          <Route path="/eat" element={<EatWhat />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* 底部 Dock 导航栏 */}
      <div className="dock dock-bottom bg-base-100 shadow-lg">
        <Link
          to="/eat"
          className={`dock-item ${
            location.pathname === "/eat" || location.pathname === "/"
              ? "dock-active"
              : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="dock-label">吃啥</span>
        </Link>

        <Link
          to="/menu"
          className={`dock-item ${
            location.pathname === "/menu" ? "dock-active" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="dock-label">菜单</span>
        </Link>

        <Link
          to="/settings"
          className={`dock-item ${
            location.pathname === "/settings" ? "dock-active" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="dock-label">设置</span>
        </Link>
      </div>
    </div>
  );
}

export default App;

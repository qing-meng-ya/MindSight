(function () {
    "use strict";

    const storageKeys = {
        users: "ft_users",
        currentUserEmail: "ft_current_user_email",
        carts: "ft_carts",
        storeOrders: "ft_store_orders",
        consultOrders: "ft_consult_orders",
        appraisalOrders: "ft_appraisal_orders",
        forumPosts: "ft_forum_posts",
        favorites: "ft_favorites"
    };

    const directions = Object.freeze({
        asker: "咨询者",
        responder: "回答者"
    });

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        } catch (error) {
            console.warn("readJSON failed", key, error);
            return fallback;
        }
    }

    function writeJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function isValidDirection(role) {
        return role === directions.asker || role === directions.responder;
    }

    function normalizeDirection(role) {
        if (isValidDirection(role)) {
            return role;
        }

        if (role === "法医" || role === "医学研究员") {
            return directions.responder;
        }

        if (role === "律师" || role === "办案人员") {
            return directions.asker;
        }

        return directions.asker;
    }

    function getUsers() {
        return readJSON(storageKeys.users, []);
    }

    function saveUsers(users) {
        writeJSON(storageKeys.users, users);
    }

    function getCurrentUserEmail() {
        return localStorage.getItem(storageKeys.currentUserEmail) || "";
    }

    function setCurrentUserEmail(email) {
        if (!email) {
            localStorage.removeItem(storageKeys.currentUserEmail);
            return;
        }
        localStorage.setItem(storageKeys.currentUserEmail, email);
    }

    function normalizeUsersDirection() {
        const users = getUsers();
        let changed = false;
        users.forEach((item) => {
            const nextRole = normalizeDirection(item.role);
            if (item.role !== nextRole) {
                item.role = nextRole;
                changed = true;
            }
        });
        if (changed) {
            saveUsers(users);
        }
    }

    function getCurrentUser() {
        const email = getCurrentUserEmail();
        if (!email) {
            return null;
        }
        const users = getUsers();
        const user = users.find((item) => item.email === email) || null;
        if (!user) {
            return null;
        }

        const nextRole = normalizeDirection(user.role);
        if (nextRole !== user.role) {
            user.role = nextRole;
            saveUsers(users);
        }

        return user;
    }

    function isAsker(user) {
        const current = user || getCurrentUser();
        return !!current && normalizeDirection(current.role) === directions.asker;
    }

    function isResponder(user) {
        const current = user || getCurrentUser();
        return !!current && normalizeDirection(current.role) === directions.responder;
    }

    function getCurrentPage() {
        const pathname = window.location.pathname || "";
        const segments = pathname.split("/").filter(Boolean);
        return segments.length ? segments[segments.length - 1] : "index.html";
    }

    function getSafeNextPage(defaultPage) {
        const next = new URLSearchParams(window.location.search).get("next");
        if (!next) {
            return defaultPage;
        }
        if (next.includes("://") || next.includes("..") || next.startsWith("/")) {
            return defaultPage;
        }
        return next;
    }

    function buildLoginUrl() {
        const page = getCurrentPage();
        return `login.html?next=${encodeURIComponent(page || "index.html")}`;
    }

    function requireLogin(actionName) {
        if (getCurrentUser()) {
            return true;
        }
        const actionText = actionName ? `后再${actionName}` : "";
        showToast(`请先登录${actionText}`, "warn", 1800);
        window.setTimeout(() => {
            window.location.href = buildLoginUrl();
        }, 500);
        return false;
    }

    function requireDirection(expectedRole, actionName) {
        if (!requireLogin(actionName)) {
            return false;
        }

        const current = getCurrentUser();
        const normalizedExpected = normalizeDirection(expectedRole);
        if (current && normalizeDirection(current.role) === normalizedExpected) {
            return true;
        }

        const actionText = actionName || "执行当前操作";
        showToast(`当前方向无权限${actionText}`, "warn", 1800);
        return false;
    }

    function showToast(message, type, duration) {
        const toastType = type || "ok";
        const lifetime = typeof duration === "number" ? duration : 2400;
        let wrap = document.getElementById("toastWrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "toastWrap";
            wrap.className = "toast-wrap";
            document.body.appendChild(wrap);
        }
        const node = document.createElement("div");
        node.className = `toast ${toastType}`;
        node.textContent = message;
        wrap.appendChild(node);
        window.setTimeout(() => {
            node.remove();
        }, lifetime);
    }

    function formatDateTime(value) {
        const date = value ? new Date(value) : new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }

    function formatCurrency(value) {
        return `￥${Number(value || 0).toLocaleString("zh-CN")}`;
    }

    function readByUser(key, email) {
        const map = readJSON(key, {});
        return map[email] || [];
    }

    function writeByUser(key, email, list) {
        const map = readJSON(key, {});
        map[email] = list;
        writeJSON(key, map);
    }

    function renderAuthNav() {
        const root = document.querySelector("[data-auth-nav]");
        if (!root) {
            return;
        }

        const user = getCurrentUser();
        if (!user) {
            root.innerHTML = [
                '<a class="btn btn-ghost" href="login.html">登录</a>',
                '<a class="btn btn-primary" href="register.html">注册</a>'
            ].join("");
            return;
        }

        root.innerHTML = [
            `<span class="nav-greet">你好，${escapeHtml(user.name)}</span>`,
            '<a class="btn btn-ghost" href="index.html">工作台</a>',
            '<button class="btn btn-secondary" type="button" data-logout-btn>退出</button>'
        ].join("");

        const logoutBtn = root.querySelector("[data-logout-btn]");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                setCurrentUserEmail("");
                showToast("已退出登录", "ok", 1400);
                window.setTimeout(() => {
                    window.location.href = "index.html";
                }, 350);
            });
        }
    }

    function setActiveNav() {
        const page = getCurrentPage() || "index.html";
        const links = document.querySelectorAll("[data-nav-link]");
        links.forEach((link) => {
            const target = link.getAttribute("href");
            if (target === page) {
                link.classList.add("active");
            }
        });
    }

    function setupMobileNav() {
        const button = document.querySelector("[data-mobile-toggle]");
        const nav = document.querySelector("[data-nav-links]");
        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", () => {
            const opening = nav.getAttribute("data-open") !== "true";
            nav.setAttribute("data-open", opening ? "true" : "false");
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                nav.setAttribute("data-open", "false");
            });
        });
    }

    function setupReveal() {
        const nodes = Array.from(document.querySelectorAll(".reveal"));
        if (!nodes.length || !("IntersectionObserver" in window)) {
            nodes.forEach((item) => item.classList.add("on"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("on");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.16 }
        );

        nodes.forEach((item) => observer.observe(item));
    }

    function setFooterYear() {
        document.querySelectorAll("[data-year]").forEach((node) => {
            node.textContent = String(new Date().getFullYear());
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        normalizeUsersDirection();
        setupMobileNav();
        setActiveNav();
        renderAuthNav();
        setupReveal();
        setFooterYear();
    });

    window.ftApp = {
        storageKeys,
        readJSON,
        writeJSON,
        getUsers,
        saveUsers,
        getCurrentUser,
        getCurrentUserEmail,
        setCurrentUserEmail,
        directions,
        isValidDirection,
        normalizeDirection,
        isAsker,
        isResponder,
        getSafeNextPage,
        buildLoginUrl,
        requireLogin,
        requireDirection,
        showToast,
        formatDateTime,
        formatCurrency,
        readByUser,
        writeByUser,
        escapeHtml
    };
})();





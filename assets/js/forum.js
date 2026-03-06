(function () {
    "use strict";

    const seedPosts = [
        {
            id: "FP001",
            title: "针器伤力学模型的证据链补强",
            category: "analysis",
            content: "分享一套在庭审中更容易被采纳的受力分析结构，重点是痕迹照片与病理描述对齐。",
            author: "系统示例",
            createdAt: "2026-03-01T08:30:00.000Z",
            likes: 12
        },
        {
            id: "FP002",
            title: "毒物筛查报告中如何处理临界值争议",
            category: "toxicology",
            content: "建议在初筛与复检之间保留同批次对照并附上仪器校准记录，可有效降低异议率。",
            author: "系统示例",
            createdAt: "2026-03-03T11:00:00.000Z",
            likes: 9
        }
    ];

    const state = {
        category: "all",
        keyword: ""
    };

    function ensurePosts() {
        const existing = ftApp.readJSON(ftApp.storageKeys.forumPosts, []);
        if (Array.isArray(existing) && existing.length) {
            return;
        }
        ftApp.writeJSON(ftApp.storageKeys.forumPosts, seedPosts);
    }

    function getPosts() {
        return ftApp.readJSON(ftApp.storageKeys.forumPosts, []);
    }

    function savePosts(list) {
        ftApp.writeJSON(ftApp.storageKeys.forumPosts, list);
    }

    function filteredPosts() {
        return getPosts()
            .filter((item) => {
                const byCategory = state.category === "all" || item.category === state.category;
                const byKeyword = !state.keyword || item.title.includes(state.keyword) || item.content.includes(state.keyword);
                return byCategory && byKeyword;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function renderPosts() {
        const container = document.getElementById("forumList");
        if (!container) {
            return;
        }

        const list = filteredPosts();
        if (!list.length) {
            container.innerHTML = '<div class="empty">暂无匹配帖子，换个关键词试试。</div>';
            return;
        }

        container.innerHTML = list
            .map(
                (item) => `
                <article class="list-item">
                    <h4>${ftApp.escapeHtml(item.title)}</h4>
                    <p>${ftApp.escapeHtml(item.content)}</p>
                    <div class="meta">
                        <span>${ftApp.escapeHtml(item.author)}</span>
                        <span>${ftApp.formatDateTime(item.createdAt)}</span>
                        <span class="pill">${ftApp.escapeHtml(item.category)}</span>
                    </div>
                    <div class="card-foot inline">
                        <button type="button" class="btn btn-ghost" data-like-id="${item.id}">赞同 ${item.likes}</button>
                    </div>
                </article>
            `
            )
            .join("");
    }

    function updateSummary() {
        const posts = getPosts();
        const node = document.getElementById("forumTotal");
        if (node) {
            node.textContent = String(posts.length);
        }
    }

    function createPost(event) {
        event.preventDefault();

        if (!ftApp.requireLogin("发布帖子")) {
            return;
        }

        const title = document.getElementById("postTitle").value.trim();
        const category = document.getElementById("postCategory").value;
        const content = document.getElementById("postContent").value.trim();

        if (title.length < 6 || content.length < 12) {
            ftApp.showToast("标题至少 6 字，内容至少 12 字", "warn");
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const posts = getPosts();
        posts.push({
            id: `FP${Date.now().toString().slice(-8)}`,
            title,
            category,
            content,
            author: user.name,
            createdAt: new Date().toISOString(),
            likes: 0
        });

        savePosts(posts);
        event.target.reset();
        updateSummary();
        renderPosts();
        ftApp.showToast("帖子已发布", "ok", 1500);
    }

    function likePost(id) {
        const posts = getPosts();
        const target = posts.find((item) => item.id === id);
        if (!target) {
            return;
        }
        target.likes += 1;
        savePosts(posts);
        renderPosts();
    }

    function bindFilter() {
        const category = document.getElementById("forumFilter");
        const keyword = document.getElementById("forumKeyword");
        const list = document.getElementById("forumList");
        const form = document.getElementById("postForm");

        if (category) {
            category.addEventListener("change", (event) => {
                state.category = event.target.value;
                renderPosts();
            });
        }

        if (keyword) {
            keyword.addEventListener("input", (event) => {
                state.keyword = event.target.value.trim();
                renderPosts();
            });
        }

        if (list) {
            list.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }
                const id = target.getAttribute("data-like-id");
                if (id) {
                    likePost(id);
                }
            });
        }

        if (form) {
            form.addEventListener("submit", createPost);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        ensurePosts();
        updateSummary();
        renderPosts();
        bindFilter();
    });
})();

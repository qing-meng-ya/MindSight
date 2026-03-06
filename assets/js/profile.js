(function () {
    "use strict";

    const STATUS = {
        pending: "待回答",
        answered: "已回答",
        canceled: "已取消"
    };

    function statusClass(status) {
        if (status === STATUS.answered) return "done";
        if (status === STATUS.canceled) return "cancel";
        return "pending";
    }

    function normalizeStatus(status) {
        if (status === STATUS.pending || status === "待确认") return STATUS.pending;
        if (status === STATUS.answered || status === "已完成") return STATUS.answered;
        if (status === STATUS.canceled) return STATUS.canceled;
        return STATUS.pending;
    }

    function normalizeOrder(order, fallbackEmail) {
        if (!order || typeof order !== "object") {
            return null;
        }

        const now = new Date().toISOString();
        const requesterEmail = (order.requesterEmail || fallbackEmail || "").trim().toLowerCase();
        return {
            id: order.id || `CO${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`,
            requesterEmail,
            requesterName: order.requesterName || requesterEmail || "匿名咨询者",
            type: order.type || "未分类咨询",
            level: order.level || "普通",
            date: order.date || "",
            slot: order.slot || "",
            contact: order.contact || "",
            note: order.note || "",
            status: normalizeStatus(order.status),
            createdAt: order.createdAt || now,
            responderEmail: (order.responderEmail || "").trim().toLowerCase(),
            responderName: order.responderName || "",
            response: order.response || "",
            respondedAt: order.respondedAt || ""
        };
    }

    function migrateLegacyConsultData(raw) {
        if (Array.isArray(raw)) {
            return raw.map((item) => normalizeOrder(item, "")).filter(Boolean);
        }

        if (!raw || typeof raw !== "object") {
            return [];
        }

        const list = [];
        Object.entries(raw).forEach(([email, orders]) => {
            if (!Array.isArray(orders)) {
                return;
            }
            orders.forEach((item) => {
                const normalized = normalizeOrder(item, email);
                if (normalized) {
                    list.push(normalized);
                }
            });
        });
        return list;
    }

    function getAllConsultOrders() {
        const raw = ftApp.readJSON(ftApp.storageKeys.consultOrders, []);
        const normalized = migrateLegacyConsultData(raw);

        if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
            ftApp.writeJSON(ftApp.storageKeys.consultOrders, normalized);
        }

        return normalized;
    }

    function getConsultOrdersForUser(user) {
        if (!user) {
            return [];
        }

        const role = ftApp.normalizeDirection(user.role);
        const all = getAllConsultOrders();
        if (role === ftApp.directions.responder) {
            return all.filter((item) => item.responderEmail === user.email);
        }
        return all.filter((item) => item.requesterEmail === user.email);
    }

    function formatFallbackDate(value, fallback) {
        if (value) {
            return value;
        }
        if (fallback) {
            return ftApp.formatDateTime(fallback);
        }
        return "未记录时间";
    }

    function renderEmpty(container, text) {
        if (!container) {
            return;
        }
        container.innerHTML = `<div class="empty">${text}</div>`;
    }

    function normalizeEmail(value) {
        return String(value || "").trim().toLowerCase();
    }

    function normalizeContact(value) {
        return String(value || "").trim();
    }

    function normalizeUrl(value) {
        const input = String(value || "").trim();
        if (!input) {
            return "";
        }
        if (/^https?:\/\//i.test(input)) {
            return input;
        }
        if (/^javascript:/i.test(input)) {
            return "";
        }
        return `https://${input}`;
    }

    function migrateUserMap(storageKey, oldEmail, newEmail) {
        const map = ftApp.readJSON(storageKey, {});
        const oldList = map[oldEmail] || [];
        if (!oldList.length) {
            return;
        }
        const newList = map[newEmail] || [];
        map[newEmail] = newList.concat(oldList);
        delete map[oldEmail];
        ftApp.writeJSON(storageKey, map);
    }

    function updateConsultOrdersEmail(oldEmail, newEmail, newName) {
        const list = getAllConsultOrders();
        let changed = false;
        const updated = list.map((item) => {
            const next = { ...item };
            if (next.requesterEmail === oldEmail) {
                next.requesterEmail = newEmail;
                next.requesterName = newName;
                changed = true;
            }
            if (next.responderEmail === oldEmail) {
                next.responderEmail = newEmail;
                next.responderName = newName;
                changed = true;
            }
            return next;
        });
        if (changed) {
            ftApp.writeJSON(ftApp.storageKeys.consultOrders, updated);
        }
    }

    function updateForumAuthor(oldName, newName) {
        const posts = ftApp.readJSON(ftApp.storageKeys.forumPosts, []);
        let changed = false;
        posts.forEach((item) => {
            if (item.author === oldName) {
                item.author = newName;
                changed = true;
            }
        });
        if (changed) {
            ftApp.writeJSON(ftApp.storageKeys.forumPosts, posts);
        }
    }

    function renderProfileSummary(user) {
        const avatarNode = document.getElementById("profileAvatar");
        const nameNode = document.getElementById("profileName");
        const roleNode = document.getElementById("profileRole");
        const emailNode = document.getElementById("profileEmail");
        const contactNode = document.getElementById("profileContact");
        const hintNode = document.getElementById("profileLoginHint");

        if (!nameNode || !roleNode || !emailNode || !avatarNode || !hintNode || !contactNode) {
            return;
        }

        if (!user) {
            avatarNode.textContent = "?";
            nameNode.textContent = "访客";
            roleNode.textContent = "未登录";
            emailNode.textContent = "";
            contactNode.textContent = "";
            hintNode.textContent = "请先登录后查看个人数据。";
            return;
        }

        const initial = user.name ? user.name.trim().slice(0, 1) : "U";
        avatarNode.textContent = initial.toUpperCase();
        nameNode.textContent = user.name || "未命名";
        roleNode.textContent = `方向：${ftApp.normalizeDirection(user.role)}`;
        emailNode.textContent = `邮箱：${user.email}`;
        contactNode.textContent = user.contact ? `联系方式：${user.contact}` : "联系方式：未填写";
        hintNode.textContent = "当前账号已登录，数据来自本地存储。";
    }

    function renderProfileForm(user) {
        const form = document.getElementById("profileForm");
        const nameInput = document.getElementById("profileNameInput");
        const emailInput = document.getElementById("profileEmailInput");
        const contactInput = document.getElementById("profileContactInput");
        const hint = document.getElementById("profileFormHint");
        const saveBtn = document.getElementById("profileSaveBtn");

        if (!form || !nameInput || !emailInput || !contactInput || !hint || !saveBtn) {
            return;
        }

        if (!user) {
            nameInput.value = "";
            emailInput.value = "";
            contactInput.value = "";
            nameInput.disabled = true;
            emailInput.disabled = true;
            contactInput.disabled = true;
            saveBtn.disabled = true;
            hint.textContent = "请先登录后编辑资料。";
            return;
        }

        nameInput.disabled = false;
        emailInput.disabled = false;
        contactInput.disabled = false;
        saveBtn.disabled = false;
        nameInput.value = user.name || "";
        emailInput.value = user.email || "";
        contactInput.value = user.contact || "";
        hint.textContent = "保存后将同步更新本地账号信息。";
    }

    function renderSecurity(user) {
        const list = document.getElementById("profileSecurityList");
        if (!list) {
            return;
        }

        if (!user) {
            renderEmpty(list, "登录后可查看安全提示。");
            return;
        }

        list.innerHTML = [
            `<div class="list-item"><h4>登录邮箱</h4><p>${ftApp.escapeHtml(user.email)}</p></div>`,
            "<div class=\"list-item\"><h4>方向锁定</h4><p>注册方向不可修改，如需调整请重新注册。</p></div>",
            "<div class=\"list-item\"><h4>密码管理</h4><p>当前为演示版，仅展示数据，不提供修改入口。</p></div>"
        ].join("");
    }

    function renderNotices(user) {
        const list = document.getElementById("profileNoticeList");
        const note = document.getElementById("profileNoticeNote");
        if (!list || !note) {
            return;
        }

        if (!user) {
            note.textContent = "登录后查看";
            renderEmpty(list, "请先登录以查看消息。");
            return;
        }

        note.textContent = "暂无消息";
        renderEmpty(list, "暂无新消息，保持关注。");
    }

    function getFavorites(user) {
        if (!user) {
            return [];
        }
        return ftApp.readByUser(ftApp.storageKeys.favorites, user.email);
    }

    function saveFavorites(user, list) {
        if (!user) {
            return;
        }
        ftApp.writeByUser(ftApp.storageKeys.favorites, user.email, list);
    }

    function renderFavorites(user) {
        const list = document.getElementById("profileFavList");
        const note = document.getElementById("profileFavNote");
        const form = document.getElementById("favoriteForm");
        if (!list || !note || !form) {
            return;
        }

        const inputs = Array.from(form.querySelectorAll("input, textarea"));
        const button = document.getElementById("favoriteSaveBtn");

        if (!user) {
            note.textContent = "登录后查看";
            inputs.forEach((item) => {
                item.disabled = true;
            });
            if (button) button.disabled = true;
            renderEmpty(list, "请先登录以查看收藏。");
            return;
        }

        inputs.forEach((item) => {
            item.disabled = false;
        });
        if (button) button.disabled = false;

        const favorites = getFavorites(user)
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        note.textContent = `共 ${favorites.length} 条`;

        if (!favorites.length) {
            renderEmpty(list, "暂无收藏内容。");
            return;
        }

        list.innerHTML = favorites
            .slice(0, 8)
            .map((item) => {
                const title = ftApp.escapeHtml(item.title || "未命名收藏");
                const noteText = ftApp.escapeHtml(item.note || "");
                const url = item.url ? ftApp.escapeHtml(item.url) : "";
                const titleHtml = url ? `<a href="${url}" target="_blank" rel="noopener">${title}</a>` : title;

                return `
                <div class="list-item">
                    <h4>${titleHtml}</h4>
                    ${noteText ? `<p>${noteText}</p>` : "<p class=\"helper\">未填写备注</p>"}
                    <div class="meta">
                        <span>${ftApp.formatDateTime(item.createdAt)}</span>
                        <button class="btn btn-ghost" type="button" data-fav-id="${item.id}">移除</button>
                    </div>
                </div>
                `;
            })
            .join("");
    }

    function renderConsults(user) {
        const list = document.getElementById("profileConsultList");
        const note = document.getElementById("profileConsultNote");
        if (!list || !note) {
            return;
        }

        if (!user) {
            note.textContent = "登录后查看";
            renderEmpty(list, "登录后可查看咨询记录。");
            return;
        }

        const role = ftApp.normalizeDirection(user.role);
        const orders = getConsultOrdersForUser(user).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        note.textContent = `共 ${orders.length} 条`;

        if (!orders.length) {
            renderEmpty(list, "暂无咨询记录。");
            return;
        }

        list.innerHTML = orders
            .slice(0, 6)
            .map((item) => {
                const title = `${ftApp.escapeHtml(item.type)} · ${ftApp.escapeHtml(item.slot || "待排期")}`;
                const desc = ftApp.escapeHtml(item.note || "未填写补充说明");
                const dateText = ftApp.escapeHtml(formatFallbackDate(item.date, item.createdAt));
                const statusText = ftApp.escapeHtml(item.status);
                const pillClass = statusClass(item.status);
                const ownerText = role === ftApp.directions.responder
                    ? `咨询者：${ftApp.escapeHtml(item.requesterName || item.requesterEmail || "匿名")}`
                    : `回答者：${ftApp.escapeHtml(item.responderName || "待分配")}`;
                const response = item.response ? `<p class=\"helper\">答复：${ftApp.escapeHtml(item.response)}</p>` : "";

                return `
                <div class="list-item">
                    <h4>${title}</h4>
                    <p>${desc}</p>
                    <div class="meta">
                        <span>${dateText}</span>
                        <span>${ownerText}</span>
                        <span class="pill ${pillClass}">${statusText}</span>
                    </div>
                    ${response}
                </div>
                `;
            })
            .join("");
    }

    function renderAppraisals(user) {
        const list = document.getElementById("profileAppraisalList");
        const note = document.getElementById("profileAppraisalNote");
        if (!list || !note) {
            return;
        }

        if (!user) {
            note.textContent = "登录后查看";
            renderEmpty(list, "登录后可查看鉴定记录。");
            return;
        }

        const orders = ftApp.readByUser(ftApp.storageKeys.appraisalOrders, user.email)
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        note.textContent = `共 ${orders.length} 条`;

        if (!orders.length) {
            renderEmpty(list, "暂无鉴定申请。");
            return;
        }

        list.innerHTML = orders
            .slice(0, 6)
            .map((item) => {
                const title = `${ftApp.escapeHtml(item.caseNo || item.id)} · ${ftApp.escapeHtml(item.typeText || item.type || "未分类")}`;
                const fee = ftApp.formatCurrency(item.fee || 0);
                const cycle = ftApp.escapeHtml(item.cycle || "待确认");
                const status = ftApp.escapeHtml(item.status || "处理中");

                return `
                <div class="list-item">
                    <h4>${title}</h4>
                    <p>预估费用 ${fee} · 周期 ${cycle}</p>
                    <div class="meta">
                        <span>${ftApp.formatDateTime(item.createdAt)}</span>
                        <span class="pill pending">${status}</span>
                    </div>
                </div>
                `;
            })
            .join("");
    }

    function renderOrders(user) {
        const list = document.getElementById("profileOrderList");
        const note = document.getElementById("profileOrderNote");
        if (!list || !note) {
            return;
        }

        if (!user) {
            note.textContent = "登录后查看";
            renderEmpty(list, "登录后可查看采购订单。");
            return;
        }

        const orders = ftApp.readByUser(ftApp.storageKeys.storeOrders, user.email)
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        note.textContent = `共 ${orders.length} 条`;

        if (!orders.length) {
            renderEmpty(list, "暂无采购订单。");
            return;
        }

        list.innerHTML = orders
            .slice(0, 6)
            .map((item) => {
                const title = `${ftApp.escapeHtml(item.id)} · ${item.items ? item.items.length : 0} 项设备`;
                const total = ftApp.formatCurrency(item.total || 0);
                const status = ftApp.escapeHtml(item.status || "处理中");

                return `
                <div class="list-item">
                    <h4>${title}</h4>
                    <p>金额 ${total}</p>
                    <div class="meta">
                        <span>${ftApp.formatDateTime(item.createdAt)}</span>
                        <span class="pill pending">${status}</span>
                    </div>
                </div>
                `;
            })
            .join("");
    }

    function renderPosts(user) {
        const list = document.getElementById("profilePostList");
        const note = document.getElementById("profilePostNote");
        if (!list || !note) {
            return;
        }

        if (!user) {
            note.textContent = "登录后查看";
            renderEmpty(list, "登录后可查看论坛帖子。");
            return;
        }

        const posts = ftApp.readJSON(ftApp.storageKeys.forumPosts, [])
            .filter((item) => item.author === user.name)
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        note.textContent = `共 ${posts.length} 条`;

        if (!posts.length) {
            renderEmpty(list, "暂无发布帖子。");
            return;
        }

        list.innerHTML = posts
            .slice(0, 6)
            .map((item) => {
                const title = ftApp.escapeHtml(item.title || "未命名帖子");
                const content = ftApp.escapeHtml(item.content || "");
                const snippet = content.length > 80 ? `${content.slice(0, 80)}...` : content || "未填写内容";
                const category = ftApp.escapeHtml(item.category || "未分类");

                return `
                <div class="list-item">
                    <h4>${title}</h4>
                    <p>${snippet}</p>
                    <div class="meta">
                        <span>${ftApp.formatDateTime(item.createdAt)}</span>
                        <span class="pill">${category}</span>
                    </div>
                </div>
                `;
            })
            .join("");
    }

    function renderCounts(user) {
        const consultNode = document.getElementById("profileConsultCount");
        const appraisalNode = document.getElementById("profileAppraisalCount");
        const orderNode = document.getElementById("profileOrderCount");
        const postNode = document.getElementById("profilePostCount");

        if (!consultNode || !appraisalNode || !orderNode || !postNode) {
            return;
        }

        if (!user) {
            consultNode.textContent = "0";
            appraisalNode.textContent = "0";
            orderNode.textContent = "0";
            postNode.textContent = "0";
            return;
        }

        consultNode.textContent = String(getConsultOrdersForUser(user).length);
        appraisalNode.textContent = String(ftApp.readByUser(ftApp.storageKeys.appraisalOrders, user.email).length);
        orderNode.textContent = String(ftApp.readByUser(ftApp.storageKeys.storeOrders, user.email).length);
        postNode.textContent = String(
            ftApp.readJSON(ftApp.storageKeys.forumPosts, []).filter((item) => item.author === user.name).length
        );
    }

    function handleProfileSubmit(event) {
        event.preventDefault();

        const user = ftApp.getCurrentUser();
        if (!user) {
            ftApp.showToast("请先登录", "warn");
            return;
        }

        const nameInput = document.getElementById("profileNameInput");
        const emailInput = document.getElementById("profileEmailInput");
        const contactInput = document.getElementById("profileContactInput");

        if (!nameInput || !emailInput || !contactInput) {
            return;
        }

        const nextName = String(nameInput.value || "").trim();
        const nextEmail = normalizeEmail(emailInput.value);
        const nextContact = normalizeContact(contactInput.value);

        if (!nextName || !nextEmail) {
            ftApp.showToast("姓名和邮箱不能为空", "warn");
            return;
        }

        const users = ftApp.getUsers();
        const index = users.findIndex((item) => item.email === user.email);
        if (index < 0) {
            ftApp.showToast("账号不存在，请重新登录", "error");
            return;
        }

        if (nextEmail !== user.email) {
            const exists = users.some((item) => item.email === nextEmail);
            if (exists) {
                ftApp.showToast("该邮箱已被使用", "warn");
                return;
            }
        }

        const oldEmail = user.email;
        const oldName = user.name;

        users[index] = {
            ...users[index],
            name: nextName,
            email: nextEmail,
            contact: nextContact
        };

        ftApp.saveUsers(users);
        ftApp.setCurrentUserEmail(nextEmail);

        if (nextEmail !== oldEmail) {
            migrateUserMap(ftApp.storageKeys.carts, oldEmail, nextEmail);
            migrateUserMap(ftApp.storageKeys.storeOrders, oldEmail, nextEmail);
            migrateUserMap(ftApp.storageKeys.appraisalOrders, oldEmail, nextEmail);
            migrateUserMap(ftApp.storageKeys.favorites, oldEmail, nextEmail);
            updateConsultOrdersEmail(oldEmail, nextEmail, nextName);
        }

        if (nextName !== oldName) {
            updateConsultOrdersEmail(nextEmail, nextEmail, nextName);
            updateForumAuthor(oldName, nextName);
        }

        ftApp.showToast("资料已更新", "ok", 1400);

        const refreshed = ftApp.getCurrentUser();
        renderProfileSummary(refreshed);
        renderProfileForm(refreshed);
        renderCounts(refreshed);
        renderSecurity(refreshed);
        renderConsults(refreshed);
        renderAppraisals(refreshed);
        renderOrders(refreshed);
        renderPosts(refreshed);
        renderNotices(refreshed);
        renderFavorites(refreshed);
    }

    function handleFavoriteSubmit(event) {
        event.preventDefault();

        const user = ftApp.getCurrentUser();
        if (!user) {
            ftApp.showToast("请先登录", "warn");
            return;
        }

        const titleInput = document.getElementById("favoriteTitle");
        const linkInput = document.getElementById("favoriteLink");
        const noteInput = document.getElementById("favoriteNote");

        if (!titleInput || !linkInput || !noteInput) {
            return;
        }

        const title = String(titleInput.value || "").trim();
        if (title.length < 2) {
            ftApp.showToast("收藏标题至少 2 个字", "warn");
            return;
        }

        const url = normalizeUrl(linkInput.value);
        const note = String(noteInput.value || "").trim();
        const favorites = getFavorites(user);

        favorites.push({
            id: `FV${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`,
            title,
            url,
            note,
            createdAt: new Date().toISOString()
        });

        saveFavorites(user, favorites);
        titleInput.value = "";
        linkInput.value = "";
        noteInput.value = "";
        renderFavorites(user);
        ftApp.showToast("已添加收藏", "ok", 1200);
    }

    function handleFavoriteAction(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const id = target.getAttribute("data-fav-id");
        if (!id) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const favorites = getFavorites(user).filter((item) => item.id !== id);
        saveFavorites(user, favorites);
        renderFavorites(user);
        ftApp.showToast("已移除收藏", "ok", 1200);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const user = ftApp.getCurrentUser();

        renderProfileSummary(user);
        renderProfileForm(user);
        renderCounts(user);
        renderSecurity(user);
        renderNotices(user);
        renderFavorites(user);
        renderConsults(user);
        renderAppraisals(user);
        renderOrders(user);
        renderPosts(user);

        const form = document.getElementById("profileForm");
        if (form) {
            form.addEventListener("submit", handleProfileSubmit);
        }

        const favForm = document.getElementById("favoriteForm");
        if (favForm) {
            favForm.addEventListener("submit", handleFavoriteSubmit);
        }

        const favList = document.getElementById("profileFavList");
        if (favList) {
            favList.addEventListener("click", handleFavoriteAction);
        }
    });
})();


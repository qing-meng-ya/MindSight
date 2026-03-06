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

    function getAllOrders() {
        const raw = ftApp.readJSON(ftApp.storageKeys.consultOrders, []);
        const normalized = migrateLegacyConsultData(raw);

        if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
            ftApp.writeJSON(ftApp.storageKeys.consultOrders, normalized);
        }

        return normalized;
    }

    function saveAllOrders(list) {
        ftApp.writeJSON(ftApp.storageKeys.consultOrders, list);
    }

    function getCurrentUserRole() {
        const user = ftApp.getCurrentUser();
        if (!user) {
            return "";
        }
        return ftApp.normalizeDirection(user.role);
    }

    function updateRoleView(user, role) {
        const roleHint = document.getElementById("consultRoleHint");
        const formTitle = document.getElementById("consultFormTitle");
        const formHint = document.getElementById("consultFormHint");
        const form = document.getElementById("consultForm");
        const responderGuide = document.getElementById("responderGuide");
        const listTitle = document.getElementById("consultListTitle");
        const listNote = document.getElementById("consultListNote");
        const statTitle = document.getElementById("consultStatTitle");

        if (!roleHint || !formTitle || !formHint || !form || !responderGuide || !listTitle || !listNote || !statTitle) {
            return;
        }

        if (!user) {
            roleHint.textContent = "请先登录后进入对应方向工作台。";
            form.style.display = "grid";
            responderGuide.style.display = "none";
            formTitle.textContent = "提交咨询预约";
            formHint.textContent = "咨询者可在此提交咨询申请。";
            listTitle.textContent = "咨询记录";
            listNote.textContent = "登录后按方向显示";
            statTitle.textContent = "咨询统计";
            return;
        }

        if (role === ftApp.directions.responder) {
            roleHint.textContent = `当前方向：回答者（${user.name}），你可以领取咨询并提交答复。`;
            form.style.display = "none";
            responderGuide.style.display = "grid";
            responderGuide.innerHTML = [
                '<div class="list-item"><h4>回答者工作台</h4><p>1. 先领取待回答咨询。</p></div>',
                '<div class="list-item"><h4>提交答复</h4><p>2. 对已领取工单填写答复后提交。</p></div>',
                '<div class="list-item"><h4>方向锁定</h4><p>3. 你的方向由注册时确定，不可更改。</p></div>'
            ].join("");
            formTitle.textContent = "回答者工作台";
            formHint.textContent = "当前账号方向不可改，仅可执行回答操作。";
            listTitle.textContent = "咨询工单池";
            listNote.textContent = "可领取并处理待回答工单";
            statTitle.textContent = "回答者统计";
            return;
        }

        roleHint.textContent = `当前方向：咨询者（${user.name}），你可以提交咨询并查看答复。`;
        form.style.display = "grid";
        responderGuide.style.display = "none";
        formTitle.textContent = "提交咨询预约";
        formHint.textContent = "当前账号方向不可改，仅可执行咨询发起操作。";
        listTitle.textContent = "我的咨询记录";
        listNote.textContent = "按账号隔离";
        statTitle.textContent = "我的咨询统计";
    }

    function updateKpiByRole(user, role, allOrders) {
        const label1 = document.getElementById("consultLabel1");
        const label2 = document.getElementById("consultLabel2");
        const label3 = document.getElementById("consultLabel3");
        const pendingNode = document.getElementById("consultPending");
        const doneNode = document.getElementById("consultDone");
        const cancelNode = document.getElementById("consultCancel");

        if (!label1 || !label2 || !label3 || !pendingNode || !doneNode || !cancelNode) {
            return;
        }

        if (!user) {
            label1.textContent = "待回答";
            label2.textContent = "已回答";
            label3.textContent = "已取消";
            pendingNode.textContent = "0";
            doneNode.textContent = "0";
            cancelNode.textContent = "0";
            return;
        }

        if (role === ftApp.directions.responder) {
            const pendingPool = allOrders.filter((item) => item.status === STATUS.pending && !item.responderEmail).length;
            const myProcessing = allOrders.filter((item) => item.status === STATUS.pending && item.responderEmail === user.email).length;
            const myAnswered = allOrders.filter((item) => item.status === STATUS.answered && item.responderEmail === user.email).length;

            label1.textContent = "待领取";
            label2.textContent = "我处理中";
            label3.textContent = "我已回答";
            pendingNode.textContent = String(pendingPool);
            doneNode.textContent = String(myProcessing);
            cancelNode.textContent = String(myAnswered);
            return;
        }

        const mine = allOrders.filter((item) => item.requesterEmail === user.email);
        const pending = mine.filter((item) => item.status === STATUS.pending).length;
        const answered = mine.filter((item) => item.status === STATUS.answered).length;
        const canceled = mine.filter((item) => item.status === STATUS.canceled).length;

        label1.textContent = "待回答";
        label2.textContent = "已回答";
        label3.textContent = "已取消";
        pendingNode.textContent = String(pending);
        doneNode.textContent = String(answered);
        cancelNode.textContent = String(canceled);
    }

    function renderAskerOrders(user, allOrders) {
        const container = document.getElementById("consultList");
        if (!container) {
            return;
        }

        const orders = allOrders
            .filter((item) => item.requesterEmail === user.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!orders.length) {
            container.innerHTML = '<div class="empty">暂无咨询记录，先提交一条咨询申请。</div>';
            return;
        }

        container.innerHTML = orders
            .map(
                (item) => `
                <div class="list-item">
                    <h4>${ftApp.escapeHtml(item.type)} · ${ftApp.escapeHtml(item.slot || "待排期")}</h4>
                    <p>${ftApp.escapeHtml(item.note || "未填写补充说明")}</p>
                    <div class="meta">
                        <span>${ftApp.escapeHtml(item.date || "未指定日期")}</span>
                        <span>${ftApp.escapeHtml(item.contact || "未填写联系方式")}</span>
                        <span class="pill ${statusClass(item.status)}">${ftApp.escapeHtml(item.status)}</span>
                    </div>
                    ${item.responderName ? `<p class="helper">回答者：${ftApp.escapeHtml(item.responderName)}</p>` : ""}
                    ${item.status === STATUS.answered ? `<p class="helper">答复：${ftApp.escapeHtml(item.response || "已答复")}</p>` : ""}
                    ${item.status === STATUS.pending ? `<div class="card-foot"><button type="button" class="btn btn-danger" data-cancel-id="${item.id}">取消咨询</button></div>` : ""}
                </div>
            `
            )
            .join("");
    }

    function renderResponderOrders(user, allOrders) {
        const container = document.getElementById("consultList");
        if (!container) {
            return;
        }

        const orders = allOrders
            .filter((item) => item.status !== STATUS.canceled)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!orders.length) {
            container.innerHTML = '<div class="empty">当前没有待处理咨询工单。</div>';
            return;
        }

        container.innerHTML = orders
            .map((item) => {
                const requester = item.requesterName || item.requesterEmail || "匿名咨询者";
                const takenByOther = item.status === STATUS.pending && item.responderEmail && item.responderEmail !== user.email;
                const minePending = item.status === STATUS.pending && item.responderEmail === user.email;
                const canTake = item.status === STATUS.pending && !item.responderEmail;

                return `
                    <div class="list-item">
                        <h4>${ftApp.escapeHtml(item.type)} · ${ftApp.escapeHtml(item.slot || "待排期")}</h4>
                        <p>${ftApp.escapeHtml(item.note || "未填写补充说明")}</p>
                        <div class="meta">
                            <span>咨询者：${ftApp.escapeHtml(requester)}</span>
                            <span>${ftApp.escapeHtml(item.date || "未指定日期")}</span>
                            <span class="pill ${statusClass(item.status)}">${ftApp.escapeHtml(item.status)}</span>
                        </div>
                        ${canTake ? `<div class="card-foot"><button type="button" class="btn btn-primary" data-take-id="${item.id}">领取工单</button></div>` : ""}
                        ${takenByOther ? `<p class="helper">已由 ${ftApp.escapeHtml(item.responderName || item.responderEmail)} 接单</p>` : ""}
                        ${minePending ? `
                            <div class="field" style="margin-top: 10px;">
                                <label>答复内容</label>
                                <textarea data-reply-input="${item.id}" placeholder="请输入答复意见（至少 6 字）"></textarea>
                            </div>
                            <div class="card-foot">
                                <button type="button" class="btn btn-secondary" data-reply-id="${item.id}">提交答复</button>
                            </div>
                        ` : ""}
                        ${item.status === STATUS.answered ? `<p class="helper">答复：${ftApp.escapeHtml(item.response || "已答复")}</p>` : ""}
                    </div>
                `;
            })
            .join("");
    }

    function renderConsultView() {
        const container = document.getElementById("consultList");
        if (!container) {
            return;
        }

        const user = ftApp.getCurrentUser();
        const role = getCurrentUserRole();
        const allOrders = getAllOrders();

        updateRoleView(user, role);
        updateKpiByRole(user, role, allOrders);

        if (!user) {
            container.innerHTML = '<div class="empty">请先登录后查看咨询数据。</div>';
            return;
        }

        if (role === ftApp.directions.responder) {
            renderResponderOrders(user, allOrders);
            return;
        }

        renderAskerOrders(user, allOrders);
    }

    function setDefaultDate() {
        const dateInput = document.getElementById("consultDate");
        if (!dateInput) {
            return;
        }
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        dateInput.min = dateStr;
        if (!dateInput.value) {
            dateInput.value = dateStr;
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!ftApp.requireDirection(ftApp.directions.asker, "提交咨询")) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const type = document.getElementById("consultType").value;
        const level = document.getElementById("consultLevel").value;
        const date = document.getElementById("consultDate").value;
        const slot = document.getElementById("consultSlot").value;
        const contact = document.getElementById("consultContact").value.trim();
        const note = document.getElementById("consultNote").value.trim();

        if (!type || !date || !slot || !contact) {
            ftApp.showToast("请完整填写咨询信息", "warn");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chosen = new Date(date);
        if (chosen < today) {
            ftApp.showToast("预约日期不能早于今天", "warn");
            return;
        }

        const allOrders = getAllOrders();
        allOrders.push({
            id: `CO${Date.now().toString().slice(-8)}`,
            requesterEmail: user.email,
            requesterName: user.name,
            type,
            level,
            date,
            slot,
            contact,
            note,
            status: STATUS.pending,
            createdAt: new Date().toISOString(),
            responderEmail: "",
            responderName: "",
            response: "",
            respondedAt: ""
        });

        saveAllOrders(allOrders);
        event.target.reset();
        setDefaultDate();
        renderConsultView();
        ftApp.showToast("咨询已提交，等待回答者接单", "ok", 1800);
    }

    function cancelOrder(id) {
        if (!ftApp.requireDirection(ftApp.directions.asker, "取消咨询")) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const allOrders = getAllOrders();
        const target = allOrders.find((item) => item.id === id && item.requesterEmail === user.email);
        if (!target || target.status !== STATUS.pending) {
            ftApp.showToast("当前工单无法取消", "warn");
            return;
        }

        target.status = STATUS.canceled;
        saveAllOrders(allOrders);
        renderConsultView();
        ftApp.showToast("咨询已取消", "ok", 1200);
    }

    function takeOrder(id) {
        if (!ftApp.requireDirection(ftApp.directions.responder, "领取工单")) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const allOrders = getAllOrders();
        const target = allOrders.find((item) => item.id === id);
        if (!target || target.status !== STATUS.pending || target.responderEmail) {
            ftApp.showToast("工单已被领取或不可处理", "warn");
            return;
        }

        target.responderEmail = user.email;
        target.responderName = user.name;
        saveAllOrders(allOrders);
        renderConsultView();
        ftApp.showToast("领取成功，请填写答复", "ok", 1300);
    }

    function replyOrder(id, content) {
        if (!ftApp.requireDirection(ftApp.directions.responder, "提交答复")) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const answer = content.trim();
        if (answer.length < 6) {
            ftApp.showToast("答复内容至少 6 个字", "warn");
            return;
        }

        const allOrders = getAllOrders();
        const target = allOrders.find((item) => item.id === id);
        if (!target || target.status !== STATUS.pending || target.responderEmail !== user.email) {
            ftApp.showToast("仅可答复你已领取的待回答工单", "warn");
            return;
        }

        target.response = answer;
        target.respondedAt = new Date().toISOString();
        target.status = STATUS.answered;
        saveAllOrders(allOrders);
        renderConsultView();
        ftApp.showToast("答复已提交", "ok", 1300);
    }

    document.addEventListener("DOMContentLoaded", () => {
        setDefaultDate();
        renderConsultView();

        const form = document.getElementById("consultForm");
        if (form) {
            form.addEventListener("submit", handleSubmit);
        }

        const list = document.getElementById("consultList");
        if (list) {
            list.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                const cancelId = target.getAttribute("data-cancel-id");
                if (cancelId) {
                    cancelOrder(cancelId);
                    return;
                }

                const takeId = target.getAttribute("data-take-id");
                if (takeId) {
                    takeOrder(takeId);
                    return;
                }

                const replyId = target.getAttribute("data-reply-id");
                if (replyId) {
                    const input = list.querySelector(`[data-reply-input="${replyId}"]`);
                    const text = input instanceof HTMLTextAreaElement ? input.value : "";
                    replyOrder(replyId, text);
                }
            });
        }
    });
})();

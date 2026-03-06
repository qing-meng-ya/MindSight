(function () {
    "use strict";

    const products = [
        { id: "dna-pro", name: "便携式 DNA 检测仪 Pro", category: "collect", price: 26800, stock: 9, desc: "现场 15 分钟完成初筛，支持离线取证模式。" },
        { id: "uv-12", name: "多波段痕迹勘验灯", category: "collect", price: 9600, stock: 22, desc: "12 波段切换，适配血迹与纤维痕迹显色。" },
        { id: "safe-box", name: "无菌样本隔离箱", category: "lab", price: 5800, stock: 16, desc: "低污染气流设计，确保样本链路完整。" },
        { id: "tox-kit", name: "快速毒物筛查试剂盒", category: "lab", price: 2280, stock: 64, desc: "30 分钟出筛查结果，可导出报告模板。" },
        { id: "cam-4k", name: "法医现场 4K 记录仪", category: "record", price: 7900, stock: 14, desc: "内置时间戳和防篡改签名。" },
        { id: "doc-pad", name: "电子取证记录板", category: "record", price: 3200, stock: 31, desc: "支持照片、语音、坐标同步记录。" }
    ];

    const state = {
        keyword: "",
        category: "all",
        cart: []
    };

    function currentCartOwner() {
        const email = ftApp.getCurrentUserEmail();
        return email || "__guest__";
    }

    function readCart() {
        const map = ftApp.readJSON(ftApp.storageKeys.carts, {});
        return map[currentCartOwner()] || [];
    }

    function writeCart(cart) {
        const map = ftApp.readJSON(ftApp.storageKeys.carts, {});
        map[currentCartOwner()] = cart;
        ftApp.writeJSON(ftApp.storageKeys.carts, map);
    }

    function migrateGuestCart() {
        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const map = ftApp.readJSON(ftApp.storageKeys.carts, {});
        const guestCart = map.__guest__ || [];
        const userCart = map[user.email] || [];
        if (!guestCart.length || userCart.length) {
            return;
        }

        map[user.email] = guestCart;
        map.__guest__ = [];
        ftApp.writeJSON(ftApp.storageKeys.carts, map);
    }

    function filteredProducts() {
        return products.filter((item) => {
            const byCategory = state.category === "all" || item.category === state.category;
            const byKeyword = !state.keyword || item.name.includes(state.keyword) || item.desc.includes(state.keyword);
            return byCategory && byKeyword;
        });
    }

    function renderProducts() {
        const container = document.getElementById("productGrid");
        if (!container) {
            return;
        }

        const list = filteredProducts();
        if (!list.length) {
            container.innerHTML = '<div class="empty">未找到符合条件的设备。</div>';
            return;
        }

        container.innerHTML = list
            .map(
                (item) => `
                <article class="card reveal">
                    <h3>${ftApp.escapeHtml(item.name)}</h3>
                    <p>${ftApp.escapeHtml(item.desc)}</p>
                    <div class="meta">
                        <span class="pill">库存 ${item.stock}</span>
                        <span class="pill">${ftApp.formatCurrency(item.price)}</span>
                    </div>
                    <div class="card-foot">
                        <button class="btn btn-primary" type="button" data-add-cart="${item.id}">加入清单</button>
                    </div>
                </article>
            `
            )
            .join("");
    }

    function calcCartTotal(cart) {
        return cart.reduce((total, item) => total + item.price * item.qty, 0);
    }

    function renderCart() {
        const listNode = document.getElementById("cartList");
        const totalNode = document.getElementById("cartTotal");
        if (!listNode || !totalNode) {
            return;
        }

        const cart = state.cart;
        if (!cart.length) {
            listNode.innerHTML = '<div class="empty">购物清单为空，先添加设备。</div>';
            totalNode.textContent = ftApp.formatCurrency(0);
            return;
        }

        listNode.innerHTML = cart
            .map(
                (item) => `
                <div class="list-item">
                    <h4>${ftApp.escapeHtml(item.name)}</h4>
                    <p>单价 ${ftApp.formatCurrency(item.price)} × ${item.qty}</p>
                    <div class="inline">
                        <button class="btn btn-ghost" type="button" data-cart-op="minus" data-id="${item.id}">-1</button>
                        <button class="btn btn-ghost" type="button" data-cart-op="plus" data-id="${item.id}">+1</button>
                        <button class="btn btn-danger" type="button" data-cart-op="remove" data-id="${item.id}">删除</button>
                    </div>
                </div>
            `
            )
            .join("");

        totalNode.textContent = ftApp.formatCurrency(calcCartTotal(cart));
    }

    function renderOrders() {
        const body = document.getElementById("storeOrdersBody");
        if (!body) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            body.innerHTML = '<tr><td colspan="5">登录后可查看你的采购记录。</td></tr>';
            return;
        }

        const orders = ftApp.readByUser(ftApp.storageKeys.storeOrders, user.email);
        if (!orders.length) {
            body.innerHTML = '<tr><td colspan="5">暂无采购订单。</td></tr>';
            return;
        }

        body.innerHTML = orders
            .slice()
            .reverse()
            .map(
                (order) => `
                <tr>
                    <td>${ftApp.escapeHtml(order.id)}</td>
                    <td>${ftApp.formatDateTime(order.createdAt)}</td>
                    <td>${order.items.length} 项设备</td>
                    <td>${ftApp.formatCurrency(order.total)}</td>
                    <td><span class="pill pending">${ftApp.escapeHtml(order.status)}</span></td>
                </tr>
            `
            )
            .join("");
    }

    function syncCart() {
        state.cart = readCart();
        renderCart();
    }

    function addToCart(productId) {
        const product = products.find((item) => item.id === productId);
        if (!product) {
            return;
        }

        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            state.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                qty: 1
            });
        }

        writeCart(state.cart);
        renderCart();
        ftApp.showToast("已加入清单", "ok", 1200);
    }

    function changeCartItem(id, op) {
        const current = state.cart.find((item) => item.id === id);
        if (!current) {
            return;
        }

        if (op === "plus") {
            current.qty += 1;
        } else if (op === "minus") {
            current.qty = Math.max(1, current.qty - 1);
        } else if (op === "remove") {
            state.cart = state.cart.filter((item) => item.id !== id);
        }

        writeCart(state.cart);
        syncCart();
    }

    function checkout() {
        if (!state.cart.length) {
            ftApp.showToast("购物清单为空", "warn");
            return;
        }

        if (!ftApp.requireLogin("结算")) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }

        const orders = ftApp.readByUser(ftApp.storageKeys.storeOrders, user.email);
        const order = {
            id: `SO${Date.now().toString().slice(-8)}`,
            createdAt: new Date().toISOString(),
            items: state.cart,
            total: calcCartTotal(state.cart),
            status: "待发货"
        };
        orders.push(order);
        ftApp.writeByUser(ftApp.storageKeys.storeOrders, user.email, orders);

        state.cart = [];
        writeCart([]);
        renderCart();
        renderOrders();
        ftApp.showToast("结算成功，采购单已生成", "ok", 1800);
    }

    function bindEvents() {
        const searchInput = document.getElementById("searchKeyword");
        const categorySelect = document.getElementById("categoryFilter");
        const productGrid = document.getElementById("productGrid");
        const cartList = document.getElementById("cartList");
        const checkoutBtn = document.getElementById("checkoutBtn");

        if (searchInput) {
            searchInput.addEventListener("input", (event) => {
                state.keyword = event.target.value.trim();
                renderProducts();
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener("change", (event) => {
                state.category = event.target.value;
                renderProducts();
            });
        }

        if (productGrid) {
            productGrid.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }
                const productId = target.getAttribute("data-add-cart");
                if (productId) {
                    addToCart(productId);
                }
            });
        }

        if (cartList) {
            cartList.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }
                const op = target.getAttribute("data-cart-op");
                const id = target.getAttribute("data-id");
                if (op && id) {
                    changeCartItem(id, op);
                }
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", checkout);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        migrateGuestCart();
        state.cart = readCart();
        renderProducts();
        renderCart();
        renderOrders();
        bindEvents();
    });
})();

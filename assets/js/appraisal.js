(function () {
    "use strict";

    const baseFee = {
        trauma: 2200,
        pathology: 3200,
        toxicology: 2800,
        psychiatry: 3600
    };

    const baseCycle = {
        trauma: 7,
        pathology: 10,
        toxicology: 8,
        psychiatry: 12
    };

    const urgencyFactor = {
        normal: 1,
        urgent: 1.35,
        express: 1.65
    };

    const urgencyCut = {
        normal: 0,
        urgent: 2,
        express: 4
    };

    function calcEstimate() {
        const type = document.getElementById("appraisalType")?.value || "trauma";
        const urgency = document.getElementById("appraisalUrgency")?.value || "normal";
        const evidenceCount = Number(document.getElementById("evidenceCount")?.value || 1);

        const base = baseFee[type] || 2200;
        const factor = urgencyFactor[urgency] || 1;
        const fee = Math.round((base + evidenceCount * 120) * factor);

        const cycle = Math.max(2, (baseCycle[type] || 7) - (urgencyCut[urgency] || 0));
        return { fee, cycle };
    }

    function paintEstimate() {
        const { fee, cycle } = calcEstimate();
        const feeNode = document.getElementById("estimateFee");
        const cycleNode = document.getElementById("estimateCycle");

        if (feeNode) feeNode.textContent = ftApp.formatCurrency(fee);
        if (cycleNode) cycleNode.textContent = `${cycle} 个工作日`;
    }

    function getOrders() {
        const user = ftApp.getCurrentUser();
        if (!user) {
            return [];
        }
        return ftApp.readByUser(ftApp.storageKeys.appraisalOrders, user.email);
    }

    function saveOrders(list) {
        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }
        ftApp.writeByUser(ftApp.storageKeys.appraisalOrders, user.email, list);
    }

    function renderOrders() {
        const body = document.getElementById("appraisalBody");
        if (!body) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            body.innerHTML = '<tr><td colspan="6">登录后可查看你的鉴定申请记录。</td></tr>';
            return;
        }

        const orders = getOrders();
        if (!orders.length) {
            body.innerHTML = '<tr><td colspan="6">暂无申请记录。</td></tr>';
            return;
        }

        body.innerHTML = orders
            .slice()
            .reverse()
            .map(
                (item) => `
                <tr>
                    <td>${ftApp.escapeHtml(item.id)}</td>
                    <td>${ftApp.escapeHtml(item.caseNo)}</td>
                    <td>${ftApp.escapeHtml(item.typeText)}</td>
                    <td>${ftApp.formatCurrency(item.fee)}</td>
                    <td>${ftApp.escapeHtml(item.cycle)}</td>
                    <td><span class="pill pending">${ftApp.escapeHtml(item.status)}</span></td>
                </tr>
            `
            )
            .join("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!ftApp.requireLogin("提交鉴定申请")) {
            return;
        }

        const caseNo = document.getElementById("caseNo").value.trim();
        const type = document.getElementById("appraisalType").value;
        const urgency = document.getElementById("appraisalUrgency").value;
        const evidenceCount = Number(document.getElementById("evidenceCount").value || 1);
        const injuryLevel = document.getElementById("injuryLevel").value;
        const details = document.getElementById("injuryDetails").value.trim();

        if (!caseNo || !type || !injuryLevel || !details) {
            ftApp.showToast("请完整填写申请信息", "warn");
            return;
        }

        const { fee, cycle } = calcEstimate();
        const typeText = document.getElementById("appraisalType").selectedOptions[0].textContent;

        const orders = getOrders();
        orders.push({
            id: `AP${Date.now().toString().slice(-8)}`,
            caseNo,
            type,
            typeText,
            urgency,
            evidenceCount,
            injuryLevel,
            details,
            fee,
            cycle: `${cycle} 个工作日`,
            status: "资料待审核",
            createdAt: new Date().toISOString()
        });

        saveOrders(orders);
        event.target.reset();
        document.getElementById("evidenceCount").value = "1";
        paintEstimate();
        renderOrders();
        ftApp.showToast("鉴定申请已提交", "ok", 1800);
    }

    document.addEventListener("DOMContentLoaded", () => {
        paintEstimate();
        renderOrders();

        const fields = ["appraisalType", "appraisalUrgency", "evidenceCount"];
        fields.forEach((id) => {
            const node = document.getElementById(id);
            if (node) {
                node.addEventListener("change", paintEstimate);
                node.addEventListener("input", paintEstimate);
            }
        });

        const form = document.getElementById("appraisalForm");
        if (form) {
            form.addEventListener("submit", handleSubmit);
        }
    });
})();

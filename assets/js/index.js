(function () {
    "use strict";

    function sumOrderCount(key) {
        const raw = ftApp.readJSON(key, {});
        if (Array.isArray(raw)) {
            return raw.length;
        }
        if (raw && typeof raw === "object") {
            return Object.values(raw).reduce((total, list) => total + (Array.isArray(list) ? list.length : 0), 0);
        }
        return 0;
    }

    function updateKpis() {
        const users = ftApp.getUsers();
        const consultCount = sumOrderCount(ftApp.storageKeys.consultOrders);
        const appraisalCount = sumOrderCount(ftApp.storageKeys.appraisalOrders);
        const forumPosts = ftApp.readJSON(ftApp.storageKeys.forumPosts, []);

        const userNode = document.getElementById("kpiUsers");
        const consultNode = document.getElementById("kpiConsult");
        const appraisalNode = document.getElementById("kpiAppraisal");
        const topicNode = document.getElementById("kpiTopic");

        if (userNode) userNode.textContent = String(users.length);
        if (consultNode) consultNode.textContent = String(consultCount);
        if (appraisalNode) appraisalNode.textContent = String(appraisalCount);
        if (topicNode) topicNode.textContent = String(forumPosts.length);
    }

    function updateWelcome() {
        const node = document.getElementById("heroWelcome");
        if (!node) {
            return;
        }

        const user = ftApp.getCurrentUser();
        if (!user) {
            node.textContent = "请注册时选择“咨询者”或“回答者”方向，方向注册后不可更改。";
            return;
        }

        node.textContent = `当前登录：${user.name}（${ftApp.normalizeDirection(user.role)}）`;
    }

    function setupBookImageFallback() {
        const images = document.querySelectorAll("[data-book] img");
        images.forEach((img) => {
            img.addEventListener("error", () => {
                img.classList.add("is-missing");
            });
        });
    }

    function setupBookCarousel() {
        const stage = document.querySelector("[data-book]");
        if (!stage) {
            return;
        }

        const pages = Array.from(stage.querySelectorAll("[data-page]"));
        if (pages.length < 2) {
            return;
        }

        let index = pages.findIndex((page) => page.classList.contains("is-active"));
        if (index < 0) {
            index = 0;
            pages[0].classList.add("is-active");
        }

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const interval = 10000;
        const flipDuration = 1200;
        let timer = null;

        const swap = (nextIndex) => {
            if (nextIndex === index) {
                return;
            }

            const current = pages[index];
            const next = pages[nextIndex];

            if (reducedMotion) {
                current.classList.remove("is-active");
                next.classList.add("is-active");
                index = nextIndex;
                return;
            }

            current.classList.add("is-flip-out");
            next.classList.add("is-flip-in");
            next.classList.add("is-active");

            window.setTimeout(() => {
                current.classList.remove("is-active");
                current.classList.remove("is-flip-out");
                next.classList.remove("is-flip-in");
            }, flipDuration);

            index = nextIndex;
        };

        const tick = () => {
            const nextIndex = (index + 1) % pages.length;
            swap(nextIndex);
        };

        const start = () => {
            if (timer) {
                return;
            }
            timer = window.setInterval(tick, interval);
        };

        const stop = () => {
            if (!timer) {
                return;
            }
            window.clearInterval(timer);
            timer = null;
        };

        stage.addEventListener("mouseenter", stop);
        stage.addEventListener("mouseleave", start);
        stage.addEventListener("focusin", stop);
        stage.addEventListener("focusout", start);

        start();
    }

    document.addEventListener("DOMContentLoaded", () => {
        updateKpis();
        updateWelcome();
        setupBookImageFallback();
        setupBookCarousel();
    });
})();

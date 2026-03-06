(function () {
    "use strict";

    function redirectAfterAuth() {
        const next = ftApp.getSafeNextPage(ftApp.getCurrentPage() || "index.html");
        window.location.href = next;
    }

    function handleLoginSubmit(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            ftApp.showToast("请填写完整登录信息", "warn");
            return;
        }

        const users = ftApp.getUsers();
        const matched = users.find((item) => item.email === email);

        if (!matched) {
            ftApp.showToast("账号不存在，请先注册", "error");
            return;
        }

        if (matched.password !== password) {
            ftApp.showToast("密码错误，请重试", "error");
            return;
        }

        ftApp.setCurrentUserEmail(matched.email);
        ftApp.showToast("登录成功", "ok", 1200);
        window.setTimeout(redirectAfterAuth, 350);
    }

    function validatePassword(password) {
        if (password.length < 6) {
            return "密码长度不能少于 6 位";
        }
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            return "密码需同时包含字母和数字";
        }
        return "";
    }

    function handleRegisterSubmit(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const role = document.getElementById("registerRole").value;
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirmPassword").value;
        const accepted = document.getElementById("registerTerms").checked;

        if (!name || !email || !password || !confirm || !role) {
            ftApp.showToast("请完整填写注册信息", "warn");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            ftApp.showToast(passwordError, "warn");
            return;
        }

        if (password !== confirm) {
            ftApp.showToast("两次输入的密码不一致", "warn");
            return;
        }

        if (!ftApp.isValidDirection(role)) {
            ftApp.showToast("请选择咨询者或回答者方向", "warn");
            return;
        }

        if (!accepted) {
            ftApp.showToast("请先同意服务条款", "warn");
            return;
        }

        const users = ftApp.getUsers();
        const exists = users.some((item) => item.email === email);
        if (exists) {
            ftApp.showToast("该邮箱已注册，请直接登录", "error");
            return;
        }

        users.push({
            name,
            email,
            role,
            password,
            createdAt: new Date().toISOString()
        });

        ftApp.saveUsers(users);
        ftApp.setCurrentUserEmail(email);
        ftApp.showToast("注册成功，已自动登录", "ok", 1400);
        window.setTimeout(redirectAfterAuth, 380);
    }

    function initLoggedInHint() {
        const hintNode = document.getElementById("authHint");
        if (!hintNode) {
            return;
        }
        const user = ftApp.getCurrentUser();
        if (!user) {
            return;
        }
        hintNode.innerHTML = `当前已登录：${ftApp.escapeHtml(user.name)}，方向：${ftApp.escapeHtml(ftApp.normalizeDirection(user.role))}（注册后不可更改）。`;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        if (loginForm) {
            loginForm.addEventListener("submit", handleLoginSubmit);
        }

        if (registerForm) {
            registerForm.addEventListener("submit", handleRegisterSubmit);
        }

        initLoggedInHint();
    });
})();

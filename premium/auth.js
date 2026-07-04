const accessKey = "top-cartoes-premium-access";
const allowedCodes = [
  "TOPPREMIUM2026",
  "HOTMARTPREMIUM",
];
const apiBase = window.HOTMART_API_BASE_URL || "";

const authEls = {
  loginForm: document.getElementById("loginForm"),
  email: document.getElementById("email"),
  accessCode: document.getElementById("accessCode"),
  emailError: document.getElementById("emailError"),
  accessCodeError: document.getElementById("accessCodeError"),
};

function getRedirectUrl() {
  const params = new URLSearchParams(location.search);
  return params.get("redirect") || "app.html?premium=1";
}

function isAuthorized() {
  return localStorage.getItem(accessKey) === "1";
}

function authorize() {
  localStorage.setItem(accessKey, "1");
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

function validateCode(code) {
  return allowedCodes.includes(String(code).trim().toUpperCase());
}

function showError(message) {
  if (authEls.accessCodeError) {
    authEls.accessCodeError.textContent = message;
  }
}

function clearErrors() {
  if (authEls.emailError) authEls.emailError.textContent = "";
  if (authEls.accessCodeError) authEls.accessCodeError.textContent = "";
}

function getApiUrl(path) {
  let base = apiBase;
  if (!base) return null;
  try {
    return new URL(path, base).toString();
  } catch (error) {
    return null;
  }
}

async function verifySubscription(email) {
  const url = getApiUrl(`/api/subscription?email=${encodeURIComponent(email)}`);
  if (!url) return { active: false, error: "Hotmart API não está configurada." };

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return { active: false, error: `Falha ao validar assinatura (${response.status}).` };
    }
    return await response.json();
  } catch (error) {
    return { active: false, error: `Erro de rede: ${error.message}` };
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearErrors();

  const email = String(authEls.email.value || "").trim().toLowerCase();
  const code = String(authEls.accessCode.value || "").trim();

  if (!validateEmail(email)) {
    if (authEls.emailError) authEls.emailError.textContent = "Informe um e-mail válido.";
    return;
  }

  if (apiBase) {
    const result = await verifySubscription(email);
    if (!result.active) {
      showError(result.error || "Assinatura não ativa ou e-mail não reconhecido.");
      return;
    }
  } else {
    if (!code) {
      showError("Informe o código de acesso, pois o backend Hotmart não está configurado.");
      return;
    }
    if (!validateCode(code)) {
      showError("Código inválido. Verifique o valor enviado pelo Hotmart.");
      return;
    }
  }

  authorize();
  window.location.href = getRedirectUrl();
}

function protectPage() {
  if (isAuthorized()) return;
  const currentPage = location.pathname.replace(/.*\//, "");
  const loginUrl = new URL("login.html", location.origin + location.pathname);
  loginUrl.searchParams.set("redirect", currentPage);
  window.location.href = loginUrl.toString();
}

if (authEls.loginForm) {
  authEls.loginForm.addEventListener("submit", handleLogin);
} else if (location.pathname.endsWith("app.html")) {
  protectPage();
}

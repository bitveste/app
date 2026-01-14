// FETCH AND SYNC AUTHENTICATED USER DATA   
async function fetchAndSyncAuthenticatedUser() {
    const loginToken = localStorage.getItem("loginToken");

    if (!loginToken) {
        window.location.href = "https://www.bitveste.com/signin";
        return;
    }

    try {
        // Decode token safely
        let payload;
        try {
            payload = JSON.parse(atob(loginToken.split(".")[1]));
        } catch {
            localStorage.removeItem("loginToken");
            window.location.href = "https://www.bitveste.com/signin";
            return;
        }
        localStorage.setItem("userEmail", payload.email);
        localStorage.setItem("userId", payload.userId);

        console.log("✅ Authenticated as", payload.email);

        // Fetch user data
        const response = await fetch("https://api.bitveste.com/api/users/me", {
            headers: {
                Authorization: `Bearer ${loginToken}`,
                "Content-Type": "application/json"
            },
            cache: "no-store"
        });

        if (response.status === 304) {
            console.log("ℹ️ User data not modified, using cached data");
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch user data: " + response.status);
        }

        const userData = await response.json();

        /* ================= BASIC ================= */
        localStorage.setItem("email", userData.email);
        localStorage.setItem("fullName", userData.fullName);
        localStorage.setItem("identity", userData.identity);
        localStorage.setItem("tier", userData.tier);
        localStorage.setItem("timezone", userData.timezone);
        localStorage.setItem("avatar", userData.avatar);
        localStorage.setItem("dateOfBirth", userData.dateOfBirth);

        /* ================= LOCATION ================= */
        localStorage.setItem("address", userData.address);
        localStorage.setItem("city", userData.city);
        localStorage.setItem("postCode", userData.postCode);
        localStorage.setItem("country", userData.country);
        localStorage.setItem("state", userData.state);

        /* ================= CONTACT ================= */
        localStorage.setItem("phoneNumber", userData.phoneNumber);

        /* ================= ACCOUNT ================= */
        localStorage.setItem("accountStatus", userData.accountStatus);

        /* ================= FINANCIALS ================= */
        localStorage.setItem("availableBalance", userData.availableBalance);
        localStorage.setItem("totalInvestedCapital", userData.totalInvestedCapital);
        localStorage.setItem("activeCapital", userData.activeCapital);
        localStorage.setItem("totalProfitEarned", userData.totalProfitEarned);
        localStorage.setItem("primaryCurrency", userData.primaryCurrency);

        /* ================= METRICS ================= */
        localStorage.setItem("iCount", userData.iCount);
        localStorage.setItem("tProfits", userData.tProfits);
        localStorage.setItem("pSold", userData.pSold);

        /* ================= COLLECTIONS ================= */
        localStorage.setItem("inventory", JSON.stringify(userData.inventory));
        localStorage.setItem("activeInvestments", JSON.stringify(userData.activeInvestments));
        localStorage.setItem("brandCardDemand", JSON.stringify(userData.brandCardDemand));
        localStorage.setItem("investmentOffers", JSON.stringify(userData.investmentOffers));

        /* ================= REFERRALS ================= */
        localStorage.setItem("referrals", userData.referrals);
        localStorage.setItem("earnings", userData.earnings);
        localStorage.setItem("referralCode", userData.referralCode);
        localStorage.setItem("referralLink", userData.referralLink);

        /* ================= SECURITY ================= */
        localStorage.setItem("kycStatus", userData.kycStatus);
        localStorage.setItem("twoFAEnabled", userData.twoFAEnabled);
        localStorage.setItem("SSN", userData.SSN);
        localStorage.setItem("bankDetails", JSON.stringify(userData.bankDetails));

        /* ================= NOTIFICATIONS ================= */
        localStorage.setItem("notifyStatus", userData.notifyStatus);
        localStorage.setItem("notificationToggles", JSON.stringify(userData.notificationToggles));
        localStorage.setItem("notifications", JSON.stringify(userData.notifications));

        /* ================= HISTORY ================= */
        localStorage.setItem("history", JSON.stringify(userData.history));
        localStorage.setItem("transactions", JSON.stringify(userData.transactions));
        localStorage.setItem("transactionHistory", JSON.stringify(userData.transactionHistory));

        /* ================= TIMESTAMPS ================= */
        localStorage.setItem("createdAt", userData.createdAt);
        localStorage.setItem("lastLogin", userData.lastLogin);

        console.log("✅ User data synced");

        // Call updateStats after successful sync
        forceAvatarFromLocalStorage();
        renderNotifications();
        updateNotifyBadge();
        updateStats();
    } catch (error) {
        console.error("⛔ User sync failed:", error);
        // Only log out on explicit auth errors
        if (error.message.includes("401") || error.message.includes("403")) {
            localStorage.removeItem("loginToken");
            window.location.href = "https://www.bitveste.com/signin";
        }
        // Otherwise, do not clear localStorage or force logout on network/cache errors
    }
}
////////////////////
//  RENDER NOTIFICATIONS
function renderNotifications() {
    const notificationsContainer = document.getElementById('notificationsList');
    notificationsContainer.innerHTML = ''; // clear existing

    // Fetch notifications from localStorage
    const notificationsJSON = localStorage.getItem('notifications');
    if (!notificationsJSON) return;

    const notificationsData = JSON.parse(notificationsJSON);
    const notificationsHistory = notificationsData.history || {};

    // Convert to array and sort by timestamp descending
    const notificationsArray = Object.values(notificationsHistory).sort((a, b) => b.timestamp - a.timestamp);

    notificationsArray.forEach(notification => {
        const notificationItem = document.createElement('a');
        notificationItem.href = "#";
        notificationItem.className = '';

        notificationItem.innerHTML = `
            <div class="d-flex flex-column">
                <p class="fw-bold mb-1">${notification.title}</p>
                <p class="mb-1">${notification.body}</p>
                <span class="text-muted small">${new Date(notification.timestamp).toLocaleString()}</span>
            </div>
        `;

        notificationsContainer.appendChild(notificationItem);
    });
}
//SEARCH BAR FUNCTIONS AND EVENTS
(function () {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');

    /* ===============================
       HARD STOP: PREVENT FORM SUBMIT
    ================================ */
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault(); // 🚫 blocks ALL redirects
        runSearch();
    });

    /* ENTER KEY */
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        }
    });

    /* CLICK SEARCH ICON */
    searchIcon.addEventListener('click', function () {
        runSearch();
    });

    /* ===============================
       SEARCH HANDLER
    ================================ */
    function runSearch() {
        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            showMessage('Nothing to search', true);
            return;
        }

        handleSearch(query);
    }

    /* ===============================
       ROUTING LOGIC
    ================================ */
    function handleSearch(query) {
        const searchMap = {
            deposit: { page: 'wallets.html', section: '#deposit-funds' },
            withdraw: { page: 'wallets.html', section: '#withdraw-funds' },
            help: { page: 'support.html', section: null },
            faq: { page: 'support.html', section: '#faqs' },
            verification: { page: 'settings.html', section: '#verification' },
            security: { page: 'settings-security.html', section: '#security' },
            wallet: { page: 'wallets.html', section: null },
            profile: { page: 'settings-profile.html', section: null },
            settings: { page: 'settings.html', section: null },
            support: { page: 'support.html', section: null },
            affiliate: { page: 'affiliates.html', section: null },
            transaction: { page: 'index.html', section: '#transaction-history' },
            investment: { page: 'index.html', section: '#active-investments' },
            balance: { page: 'index.html', section: '#balance-trends' },
            home: { page: 'index.html', section: null }
        };

        const result = Object.entries(searchMap).find(
            ([key]) => key.includes(query) || query.includes(key)
        );

        if (!result) {
            showMessage('No results found for: ' + query, true);
            return;
        }

        const [, { page, section }] = result;

        if (
            page === 'index.html' &&
            section &&
            window.location.pathname.endsWith('index.html')
        ) {
            document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = page;
        }
    }

    /* ===============================
       MESSAGE DISPLAY
    ================================ */
    function showMessage(message, isError = false) {
        const messageBox = document.getElementById('message');
        if (!messageBox) return;

        const icon = isError
            ? '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';

        messageBox.innerHTML = `${icon} ${message}`;
        messageBox.className = isError ? 'error show' : 'success show';

        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 4000);
    }
})();
/////////////////////
// Set badge visibility based on localStorage
                                        function updateNotifyBadge() {
                                            const status = localStorage.getItem('notifyStatus');
                                            const badge = document.getElementById('notifyBadge');
                                            if (badge) {
                                                if (status === 'true') {
                                                    badge.style.visibility = 'visible';
                                                } else {
                                                    badge.style.visibility = 'hidden';
                                                }
                                            }
                                        }
                                        updateNotifyBadge();

                                        // Handle bell click
                                        document.getElementById('notifyBellWrapper').addEventListener('click', async function() {
                                            localStorage.setItem('notifyStatus', 'false');
                                            updateNotifyBadge();
                                            const email = localStorage.getItem('email');
                                            const loginToken = localStorage.getItem('loginToken');
                                            if (email && loginToken) {
                                                await fetch('https://api.bitveste.com/api/notify-badge-status', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${loginToken}`
                                                    },
                                                    body: JSON.stringify({ notifyStatus: false, email })
                                                });
                                            }
                                        });
////////////////////
//LOGOUT HANDLER//
                                            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                                                // Clear user session data (example: localStorage/sessionStorage)
                                                localStorage.clear();
                                                sessionStorage.clear();
                                                // Redirect to www.bitveste.com/signin
                                                window.location.href = 'https://www.bitveste.com/signin';
                                                // Prevent default link behavior
                                                e.preventDefault();
                                            });

//////////////////
// Funding source tab logic
                    document.querySelectorAll('.funding-source-item').forEach(function(item) {
                        item.addEventListener('click', function() {
                            document.querySelectorAll('.funding-source-item').forEach(i => {
                                i.classList.remove('active');
                                i.querySelector('.arrow-indicator').classList.add('d-none');
                            });
                            item.classList.add('active');
                            item.querySelector('.arrow-indicator').classList.remove('d-none');
                            // Hide all details
                            document.getElementById('bank-details').classList.add('d-none');
                            document.getElementById('creditline-details').classList.add('d-none');
                            document.getElementById('giftcard-details').classList.add('d-none');
                            document.getElementById('card-details').classList.add('d-none');
                            // Show selected
                            const src = item.getAttribute('data-source');
                            if (src === 'bank') document.getElementById('bank-details').classList.remove('d-none');
                            if (src === 'creditline') document.getElementById('creditline-details').classList.remove('d-none');
                            if (src === 'giftcard') document.getElementById('giftcard-details').classList.remove('d-none');
                            if (src === 'card') document.getElementById('card-details').classList.remove('d-none');
                        });
                    });
                    // Initial arrow indicator setup
                    document.querySelectorAll('.funding-source-item').forEach(function(item) {
                        if (item.classList.contains('active')) {
                            item.querySelector('.arrow-indicator').classList.remove('d-none');
                        } else {
                            item.querySelector('.arrow-indicator').classList.add('d-none');
                        }
                    });
                    // Enable Bootstrap tooltips
                    if (window.bootstrap) {
                        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                        tooltipTriggerList.map(function (tooltipTriggerEl) {
                            return new bootstrap.Tooltip(tooltipTriggerEl);
                        });
                    }
//////////////
// FUNCTION TO UPDATE DASHBOARD STATS FROM LOCALSTORAGE
function updateStats() {
    const fullName = localStorage.getItem('fullName') || 'New User';
    const email = localStorage.getItem('email') || 'user@example.com';

    document.querySelectorAll('#emailDisplay, #emailDisplay2').forEach(el => { el.textContent = email; });
    document.querySelectorAll('#fullNameDisplay, #fullNameDisplay2').forEach(el => { el.textContent = fullName; });
}
//FUNCTIONS REGARDING INDEX.HTML AND DASHBOARD STATS RENDERING
//ONBOARDING FUNCTIONALITY
// FUNCTION TO HANDLE AVATAR PREVIEW (separated for img and img2)
function forceAvatarFromLocalStorage() {
    const img = document.getElementById('avatarPreview');
    const avatar = localStorage.getItem('avatar');
    if (!img) return;
    if (avatar === 'images/avatar/3.jpg') {
        const fullName = (localStorage.getItem('fullName') || '').trim();
        const firstLetter = fullName.charAt(0).toLowerCase();
        img.src = `images/avatar/${firstLetter}.png`;
    } else if (avatar) {
        img.src = avatar;
    }
}
///////////////////
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    fetchAndSyncAuthenticatedUser();
  }
});

// Call handleMagicLinkLoginToken and then fetchAndSyncAuthenticatedUser in order
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndSyncAuthenticatedUser();
});
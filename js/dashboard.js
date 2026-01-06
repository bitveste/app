// FUNCTION TO HANDLE AUTHENTICATION VIA MAGIC LINK TOKENS AND FETCHING USER DATA
//THIS IS PART OF GENERAL CODE FOR ALL PAGES REQUIRING AUTHENTICATION
async function handleMagicLinkLoginToken() {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
        localStorage.setItem("loginToken", tokenFromURL);

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    }

    const loginToken = localStorage.getItem("loginToken");

    if (!loginToken) {
        window.location.href = "https://www.bitveste.com/signin";
        return;
    }
}
    
async function fetchAndSyncAuthenticatedUser() {
    const loginToken = localStorage.getItem("loginToken");

    if (!loginToken) {
        window.location.href = "https://www.bitveste.com/signin";
        return;
    }

    try {
        // Decode token
        const payload = JSON.parse(atob(loginToken.split(".")[1]));
        localStorage.setItem("userEmail", payload.email);
        localStorage.setItem("userId", payload.userId);

        console.log("✅ Authenticated as", payload.email);

        // Fetch user data
        const response = await fetch("https://api.bitveste.com/api/users/me", {
            headers: {
                Authorization: `Bearer ${loginToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
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
        updateStats();

    } catch (error) {
        console.error("⛔ User sync failed:", error);
        localStorage.clear();
        localStorage.removeItem("loginToken");
        window.location.href = "https://www.bitveste.com/signin";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchAndSyncAuthenticatedUser();
});

// FUNCTION TO RENDER NOTIFICATIONS FROM LOCALSTORAGE
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

// Call on DOM load
document.addEventListener('DOMContentLoaded', () => {
    renderNotifications();
});

//FUNCTIONS REGARDING INDEX.HTML AND DASHBOARD STATS RENDERING
//ONBOARDING FUNCTIONALITY
// FUNCTION TO HANDLE AVATAR PREVIEW (separated for img and img2)
function forceAvatarFromLocalStorage() {
    const img = document.getElementById('avatarPreview');
    const avatar = localStorage.getItem('avatar');
    if (img && avatar) img.src = avatar;
}

document.addEventListener('DOMContentLoaded', forceAvatarFromLocalStorage);

//ONBOARDING FUNCTION
async function onboarding() {
    if (localStorage.getItem('identity') === 'new') {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
        `;

        let currentStep = 1;
        const totalSteps = 3;

        function spinnerHtml() {
            return `<span class="spinner" style="display:inline-block;width:20px;height:20px;border:2px solid #eee;border-top:2px solid #2F2CD8;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;"></span>`;
        }

        // Add spinner keyframes to document head if not already present
        if (!document.getElementById('onboarding-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'onboarding-spinner-style';
            style.innerHTML = `
                @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }
            `;
            document.head.appendChild(style);
        }

        function updateContent() {
            modalContent.innerHTML = '';
            
            // Progress indicator
            const progress = document.createElement('div');
            progress.style.cssText = `
                width: 100%;
                height: 4px;
                background: #eee;
                margin-bottom: 20px;
            `;
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                width: ${(currentStep/totalSteps) * 100}%;
                height: 100%;
                background: #2F2CD8;
                transition: width 0.3s;
            `;
            progress.appendChild(progressBar);
            modalContent.appendChild(progress);

            switch(currentStep) {
                case 1:
                    modalContent.innerHTML += `
                        <h2 style="text-align: center; color: #050505;">Welcome to Bitveste! 🎉</h2>
                        <p style="text-align: center; margin: 20px 0;">We're excited to have you join our community!</p>
                        <button id="nextStepBtn" style="width: 100%; padding: 10px; background: #2F2CD8; color: white; border: none; border-radius: 5px; cursor: pointer;">Next</button>
                    `;
                    break;
                case 2:
                    modalContent.innerHTML += `
                        <h2 style="text-align: center; color: #050505;">We'd Love to Know You Better!</h2>
                        <form id="userFormOnboarding" style="margin: 20px 0;">
                            <input type="text" id="userNameOnboarding" placeholder="Enter your full name" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px;" required>
                            <button type="submit" id="submitOnboardingBtn" style="width: 100%; padding: 10px; background: #2F2CD8; color: white; border: none; border-radius: 5px; cursor: pointer;">Next</button>
                        </form>
                    `;
                    break;
                case 3:
                    modalContent.innerHTML += `
                        <h2 style="text-align: center; color: #050505; font-size: 28px; margin-bottom: 30px;">Your Journey Begins Here!</h2>
                        <div style="margin: 20px 0; background: #f8f9fa; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <i class="fi fi-rr-shop" style="font-size: 24px; margin-right: 10px; color: #2F2CD8;"></i>
                                <p style="margin: 0; font-size: 16px; color: #444;">Explore available retail investment opportunities</p>
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <i class="fi fi-rr-chart-histogram" style="font-size: 24px; margin-right: 10px; color: #2F2CD8;"></i>
                                <p style="margin: 0; font-size: 16px; color: #444;">Track investment progress and store performance</p>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <i class="fi fi-rr-credit-card" style="font-size: 24px; margin-right: 10px; color: #2F2CD8;"></i>
                                <p style="margin: 0; font-size: 16px; color: #444;">Apply for a Bitveste credit card and manage your finances</p>
                            </div>
                        </div>
                        <button id="finishOnboardingBtn" style="width: 100%; padding: 15px; background: #2F2CD8; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: bold; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Let's Get Started!</button>
                    `;
                    break;
            }
        }
        function attachEvents() {
            if (currentStep === 1) {
                const nextBtn = modalContent.querySelector('#nextStepBtn');
                if (nextBtn) {
                    nextBtn.onclick = () => {
                        currentStep++;
                        updateContent();
                        attachEvents();
                    };
                }
            }
            if (currentStep === 2) {
                const userFormOnboarding = modalContent.querySelector('#userFormOnboarding');
                const submitBtn = modalContent.querySelector('#submitOnboardingBtn');
                if (userFormOnboarding && submitBtn) {
                    userFormOnboarding.onsubmit = async (e) => {
                        e.preventDefault();
                        submitBtn.disabled = true;
                        const originalText = submitBtn.innerHTML;
                        submitBtn.innerHTML = spinnerHtml() + "Submitting...";
                        const fullName = modalContent.querySelector('#userNameOnboarding').value;
                        try {
                            const response = await fetch('https://api.bitveste.com/api/users/updateFullName', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ 
                                    fullName,
                                    email: localStorage.getItem('email')
                                })
                            });
                            if (response.ok) {
                                currentStep++;
                                updateContent();
                                attachEvents();
                            } else {
                                submitBtn.innerHTML = originalText;
                                submitBtn.disabled = false;
                            }
                        } catch (error) {
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            console.error('Error updating user data:', error);
                        }
                    };
                }
            }
            if (currentStep === 3) {
                const finishBtn = modalContent.querySelector('#finishOnboardingBtn');
                if (finishBtn) {
                    finishBtn.onclick = async () => {
                        finishBtn.disabled = true;
                        const originalText = finishBtn.innerHTML;
                        finishBtn.innerHTML = spinnerHtml() + "Finishing...";
                        try {
                            const response = await fetch('https://api.bitveste.com/api/users/onboard', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    email: localStorage.getItem('email')
                                })
                            });
                            if (response.ok) {
                                localStorage.setItem('identity', 'old');
                                modal.remove();
                                fetchAndSyncAuthenticatedUser();
                            } else {
                                finishBtn.innerHTML = originalText;
                                finishBtn.disabled = false;
                            }
                        } catch (error) {
                            finishBtn.innerHTML = originalText;
                            finishBtn.disabled = false;
                            console.error('Error updating onboarding status:', error);
                        }
                    };
                }
            }
        }

        updateContent();
        attachEvents();
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
}
// Call onboarding() when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', onboarding);

// FUNCTION TO UPDATE DASHBOARD STATS FROM LOCALSTORAGE
function updateStats() {
    const availableBalance = localStorage.getItem('availableBalance') || '0';
    const totalInvestedCapital = localStorage.getItem('totalInvestedCapital') || '0';
    const activeCapital = localStorage.getItem('activeCapital') || '0';
    const totalProfitEarned = localStorage.getItem('totalProfitEarned') || '0';
    const primaryCurrency = (localStorage.getItem('primaryCurrency') || 'USD').toUpperCase();
    const fullName = localStorage.getItem('fullName') || 'New User';
    const email = localStorage.getItem('email') || 'user@example.com';

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const currencySymbols = {
        'USD': '$',
        'GBP': '£',
        'EUR': '€'
    };

    const symbol = currencySymbols[primaryCurrency] || '$';

    document.getElementById('totalInvestedCapitalDisplay').textContent = `${symbol}${formatNumber(totalInvestedCapital)}`;
    document.getElementById('activeCapitalDisplay').textContent = `${symbol}${formatNumber(activeCapital)}`;
    document.getElementById('availableBalanceDisplay').textContent = `${symbol}${formatNumber(availableBalance)}`;
    document.getElementById('totalProfitEarnedDisplay').textContent = `${symbol}${formatNumber(totalProfitEarned)}`;
    document.querySelectorAll('#emailDisplay, #emailDisplay2').forEach(el => { el.textContent = email; });
    document.querySelectorAll('#fullNameDisplay, #fullNameDisplay2').forEach(el => { el.textContent = fullName; });
}
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
});
document.addEventListener('DOMContentLoaded', function() {
                                // Responsive tooltip positioning: left/right depending on space
                                document.querySelectorAll('.info-tooltip').forEach(function(tooltip) {
                                    tooltip.addEventListener('mouseenter', positionTooltip);
                                    tooltip.addEventListener('focus', positionTooltip);
                                    function positionTooltip() {
                                        var tip = tooltip.querySelector('.tooltip-text');
                                        if (!tip) return;
                                        tip.style.left = '';
                                        tip.style.right = '';
                                        tip.style.transform = '';
                                        tip.style.bottom = '125%';
                                        // Get bounding rects
                                        var rect = tooltip.getBoundingClientRect();
                                        var tipRect = tip.getBoundingClientRect();
                                        var spaceLeft = rect.left;
                                        var spaceRight = window.innerWidth - rect.right;
                                        // Prefer side with more space
                                        if (spaceRight > spaceLeft) {
                                            // Show to right if enough space
                                            tip.style.left = '100%';
                                            tip.style.right = 'auto';
                                            tip.style.transform = 'translateX(10px)';
                                            tip.style.bottom = '0';
                                        } else {
                                            // Show to left if more space
                                            tip.style.right = '100%';
                                            tip.style.left = 'auto';
                                            tip.style.transform = 'translateX(-10px)';
                                            tip.style.bottom = '0';
                                        }
                                        // On mobile, always center below
                                        if (window.innerWidth < 600) {
                                            tip.style.left = '0';
                                            tip.style.right = '0';
                                            tip.style.transform = 'none';
                                            tip.style.bottom = '125%';
                                        }
                                    }
                                });
                            });

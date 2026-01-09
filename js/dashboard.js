// FUNCTION TO HANDLE AUTHENTICATION VIA MAGIC LINK TOKENS AND FETCHING USER DATA
// THIS IS PART OF GENERAL CODE FOR ALL PAGES REQUIRING AUTHENTICATION
// Ensure handleMagicLinkLoginToken runs before fetchAndSyncAuthenticatedUser
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

// Call handleMagicLinkLoginToken and then fetchAndSyncAuthenticatedUser in order
document.addEventListener("DOMContentLoaded", async () => {
    await handleMagicLinkLoginToken();
    await fetchAndSyncAuthenticatedUser();
});

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
        onboarding();
        updateStats();
        updateStatWidgets();
        renderNotifications();
        initOffers();
        renderActiveInvestmentsAndTransactions();
        updateNotifyBadge();
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

//PERIOD OVER PERIOD CHANGE CODE
// Example previous values, replace with your actual data source
                const previousStats = {
                    totalInvestedCapital: 0,
                    activeCapital: 0,
                    availableBalance: 0,
                    totalProfitEarned: 0
                };

                function updatePeriodChange(current, previous, changeElem) {
                    if (current > previous) {
                        changeElem.classList.remove('text-danger');
                        changeElem.classList.add('text-success');
                    } else {
                        changeElem.classList.remove('text-success');
                        changeElem.classList.add('text-danger');
                    }
                }

                // Example: update after fetching/displaying new values
                function updateStatWidgets() {
                    const totalInvestedCapital = parseFloat(document.getElementById('totalInvestedCapitalDisplay').textContent.replace(/[^0-9.-]+/g,"")) || 0;
                    const activeCapital = parseFloat(document.getElementById('activeCapitalDisplay').textContent.replace(/[^0-9.-]+/g,"")) || 0;
                    const availableBalance = parseFloat(document.getElementById('availableBalanceDisplay').textContent.replace(/[^0-9.-]+/g,"")) || 0;
                    const totalProfitEarned = parseFloat(document.getElementById('totalProfitEarnedDisplay').textContent.replace(/[^0-9.-]+/g,"")) || 0;

                    updatePeriodChange(totalInvestedCapital, previousStats.totalInvestedCapital, document.getElementById('totalInvestedCapitalChange'));
                    updatePeriodChange(activeCapital, previousStats.activeCapital, document.getElementById('activeCapitalChange'));
                    updatePeriodChange(availableBalance, previousStats.availableBalance, document.getElementById('availableBalanceChange'));
                    updatePeriodChange(totalProfitEarned, previousStats.totalProfitEarned, document.getElementById('totalProfitEarnedChange'));
                }

                // Call this after updating the h3 values
                // updateStatWidgets();

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

//ONBOARDING FUNCTION
async function onboarding() {
    // Prevent multiple onboarding popups
    if (document.getElementById('onboarding-modal')) return;

    if (localStorage.getItem('identity') === 'new') {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'onboarding-modal';
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
//  TOOLTIP POSITIONING AND DYNAMIC OFFERS RENDERING
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
// DYNAMIC OFFERS RENDERING
function initOffers() {
    const offersListEl = document.getElementById('dynamicOffersList');
    if (!offersListEl) {
        console.error("dynamicOffersList not found");
        return;
    }

    let offers = [];
    let currentIndex = 0;
    const PAGE_SIZE = 10;

    // Helper to shuffle array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Render a single offer card
    function renderOfferCard(offer) {
        return `
        <li class="d-flex justify-content-between active flex-column align-items-start p-3 border mb-3 offer-card">
            <div class="w-100 d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h5 class="mb-1">${offer.offerName || 'Untitled Offer'}</h5>
                    <span class="badge bg-primary">${offer.id ? 'ID-' + offer.id : ''}</span>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">${offer.status || 'Open'}</span>
                </div>
            </div>
            <div class="w-100 mb-2">
                <strong>Minimum Contribution:</strong> $${offer.minimumContribution || '-'}<br>
                <strong>Potential Net Earnings:</strong> ${offer.potentialNetEarnings || '-'}<br>
                <strong>Estimated Return:</strong> ${offer.percentage || '-'}
            </div>
            <div class="w-100 mb-2">
                <strong>Use of Funds:</strong> ${offer.useOfFunds || '-'}
            </div>
            <div class="w-100 mb-2">
                <strong>Return Model:</strong> ${offer.returnModel || '-'}<br>
                <strong>Profit Distribution:</strong> ${offer.profitDistribution || '-'}
            </div>
            <div class="w-100 mb-2">
                <strong>Settlement Period:</strong> ${offer.settlementPeriod || '-'}
            </div>
            <div class="w-100 mb-2">
                <strong>Risk Disclosure:</strong> ${offer.riskDisclosure || '-'}
            </div>
            <div class="w-100 mb-2 text-center">
                <a href="#" class="text-warning">-Discuss Offer-</a>
            </div>
            <div class="w-100 mb-2">
                <a href="#" class="btn btn-outline-success btn-sm invest-now-btn" data-offer-id="${offer.id}">
                    <i class="fi fi-rr-handshake" style="margin-right:6px;"></i>
                    Participate
                </a>
            </div>
        </li>
        `;
    }

    function loadOffersFromLocalStorage() {
        let offersData = [];
        try {
            const raw = localStorage.getItem('investmentOffers');
            if (raw) {
                offersData = JSON.parse(raw);
                if (!Array.isArray(offersData)) offersData = [];
            }
        } catch (e) {
            offersData = [];
        }
        return offersData;
    }

    function renderNextOffers() {
        const next = offers.slice(currentIndex, currentIndex + PAGE_SIZE);
        next.forEach(offer => {
            offersListEl.insertAdjacentHTML('beforeend', renderOfferCard(offer));
        });
        currentIndex += PAGE_SIZE;
        const loadMoreBtn = document.getElementById('loadMoreOffersBtn');
        if (currentIndex >= offers.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
        attachInvestNowEvents();
        // 🔁 UPDATE SCROLL AFTER DYNAMIC RENDER
        window.psOffers?.update();
    }

    function startOffers() {
        offersListEl.innerHTML = '';
        offers = loadOffersFromLocalStorage();
        if (!offers.length) {
            offersListEl.innerHTML = '<li class="text-center text-muted py-4">No investment offers found.</li>';
            document.getElementById('loadMoreOffersBtn').style.display = 'none';
            // 🔁 UPDATE SCROLL AFTER DYNAMIC RENDER
            window.psOffers?.update();
            return;
        }
        offers = shuffle(offers);
        currentIndex = 0;
        renderNextOffers();
        // 🔁 UPDATE SCROLL AFTER DYNAMIC RENDER
        window.psOffers?.update();
    }

    const loadMoreBtn = document.getElementById('loadMoreOffersBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', renderNextOffers);
    }

    // Attach Invest Now button events
    function attachInvestNowEvents() {
        document.querySelectorAll('.invest-now-btn').forEach(btn => {
            // Remove any previous event listeners by replacing the element
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                const offerId = newBtn.getAttribute('data-offer-id');
                const offer = offers.find(o => String(o.id) === String(offerId));
                if (offer) {
                    // Show processing state
                    newBtn.disabled = true;
                    const originalHtml = newBtn.innerHTML;
                    newBtn.innerHTML = "Processing...";
                    try {
                        await showAllocationPopup(offer);
                    } finally {
                        newBtn.disabled = false;
                        newBtn.innerHTML = originalHtml;
                    }
                }
            });
        });
    }

    // Allocation popup function (Institutional, Calm, Informational)
    async function showAllocationPopup(offer) {
        await fetchAndSyncAuthenticatedUser();
        const availableBalance = parseFloat(localStorage.getItem('availableBalance') || '0');
        const primaryCurrency = (localStorage.getItem('primaryCurrency') || 'USD').toUpperCase();
        const currencySymbol = { USD: '$', GBP: '£', EUR: '€' }[primaryCurrency] || '$';

        // Get estimated net earnings range from localStorage or offer
        let baseEarningsMin = 0, baseEarningsMax = 0;
        let baseEarningsText = '—';
        if (offer.estimatedNetEarnings) {
            baseEarningsText = offer.estimatedNetEarnings;
        } else if (offer.potentialNetEarnings) {
            let match = String(offer.potentialNetEarnings).match(/(\d+)[^\d]+(\d+)/);
            if (match) {
                baseEarningsMin = parseInt(match[1]);
                baseEarningsMax = parseInt(match[2]);
                baseEarningsText = `${currencySymbol}${baseEarningsMin.toLocaleString()} – ${currencySymbol}${baseEarningsMax.toLocaleString()}`;
            } else {
                baseEarningsText = offer.potentialNetEarnings;
            }
        } else {
            baseEarningsText = `${currencySymbol}—`;
        }

        // Modal setup
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5);
            display:flex; align-items:center; justify-content:center; z-index:2000;
        `;
        modal.className = 'allocation-modal';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background:#f8f9fb; padding:20px 20px; border-radius:8px; max-width:820px; width:98vw; box-shadow:0 8px 32px rgba(0,0,0,0.12);
            font-family:inherit; max-height:90vh; overflow-y:auto;
        `;
        modalContent.className = 'allocation-modal-content';

        // Mobile optimization
        const mobileStyle = document.createElement('style');
        mobileStyle.innerHTML = `
            @media (max-width: 600px) {
                .allocation-modal-content {
                    max-width: 98vw !important;
                    width: 98vw !important;
                    padding: 10px 5px !important;
                    border-radius: 0 !important;
                    font-size: 15px !important;
                }
                .allocation-modal {
                    align-items: flex-end !important;
                }
            }
        `;
        document.head.appendChild(mobileStyle);

        let allocation = parseFloat(offer.minimumContribution || '3000');
        let allocationPresets = [
            allocation,
            allocation * 3,
            allocation * 9
        ];
        let selectedPreset = allocationPresets[0];
        let allocationInputValue = selectedPreset;

        // Format currency without currency code at the end
        function formatCurrency(val) {
            return `${currencySymbol}${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        function infoIcon(tooltipText) {
            return `<span style="display:inline-block;vertical-align:middle;cursor:pointer;" title="${tooltipText}">
                <svg width="16" height="16" fill="#6c757d" style="margin-left:4px;" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#6c757d" stroke-width="1.5" fill="none"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#6c757d">i</text></svg>
            </span>`;
        }

        function getEarningsRange(allocationValue) {
            if (baseEarningsMin && baseEarningsMax) {
                // Calculate multiplier
                let multiplier = allocationValue / allocation;
                let min = baseEarningsMin * multiplier;
                let max = baseEarningsMax * multiplier;
                return `${currencySymbol}${min.toLocaleString(undefined, {maximumFractionDigits:2})} – ${currencySymbol}${max.toLocaleString(undefined, {maximumFractionDigits:2})}`;
            }
            return baseEarningsText;
        }

        function spinnerHtml() {
            return `<span class="spinner" style="display:inline-block;width:20px;height:20px;border:2px solid #eee;border-top:2px solid #2F2CD8;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;"></span>`;
        }
        // Add spinner keyframes to document head if not already present
        if (!document.getElementById('allocation-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'allocation-spinner-style';
            style.innerHTML = `
                @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }
            `;
            document.head.appendChild(style);
        }

        function updateContent() {
            modalContent.innerHTML = `
                <div style="margin-bottom:24px;">
                    <div style="font-size:18px; color:#2F2CD8; font-weight:500; margin-bottom:4px;">${offer.offerName || 'Retail Inventory'}</div>
                    <div style="font-size:13px; color:#6c757d; margin-bottom:0;">Participation in a retail inventory revenue cycle</div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:18px; margin-bottom:24px;">
                    <div style="flex:1; min-width:220px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:10px 18px 10px 18px; min-height:70px;">
                        <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:2px;">Funding Source ${infoIcon('Funds are allocated toward inventory purchasing for this offer.')}</div>
                        <div style="font-size:16px; color:#2F2CD8; font-weight:600; margin-bottom:2px;">Available Balance: ${formatCurrency(availableBalance)}</div>
                        <div style="font-size:12px; color:#6c757d;">Funds available for allocation</div>
                    </div>
                    <div style="flex:1; min-width:220px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:10px 18px 10px 18px; min-height:70px;">
                        <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:2px;">Minimum Allocation</div>
                        <div style="font-size:16px; color:#1a2233; font-weight:600; margin-bottom:2px;">${formatCurrency(allocationPresets[0])}</div>
                        <div style="font-size:12px; color:#6c757d;">Required minimum to participate in this inventory cycle</div>
                    </div>
                    <div style="flex:1; min-width:220px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:10px 18px 10px 18px; min-height:70px;">
                        <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:2px;">Max Allocation</div>
                        <div style="font-size:16px; color:#1a2233; font-weight:600; margin-bottom:2px;">${formatCurrency(allocationPresets[2])}</div>
                        <div style="font-size:12px; color:#6c757d;">Maximum allocation for this offer</div>
                    </div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:24px; margin-bottom:18px;">
                    <div style="flex:1; min-width:220px;">
                        <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:4px;">Allocation Amount</div>
                        <div style="display:flex; gap:10px; margin-bottom:8px;">
                            ${allocationPresets.map((amt) => `
                                <button type="button" class="allocation-preset-btn" data-amt="${amt}" style="
                                    flex:1; padding:10px 0; border-radius:8px; border:1px solid #d1d5db;
                                    background:${allocationInputValue === amt ? '#e3e6ee' : '#fff'};
                                    color:#1a2233; font-weight:500; font-size:15px; cursor:pointer;
                                ">${formatCurrency(amt)}</button>
                            `).join('')}
                        </div>
                        <input type="number" min="${allocationPresets[0]}" max="${allocationPresets[2]}" step="100" id="allocationInput" value="${allocationInputValue}" style="
                            width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db; font-size:15px; margin-bottom:4px; color:#1a2233; background:#fff;
                        ">
                        <div style="font-size:12px; color:#6c757d;">Allocation size determines proportional revenue share.</div>
                    </div>
                    <div style="flex:1; min-width:220px;">
                        <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:2px;">Estimated Net Earnings (per cycle) ${infoIcon('Earnings depend on sell-through, pricing, and operating costs.')}</div>
                        <div style="font-size:16px; color:#1a2233; font-weight:600; margin-bottom:2px;" id="earningsRangeDisplay">${getEarningsRange(allocationInputValue)}</div>
                        <div style="font-size:12px; color:#6c757d;">Based on historical inventory margins. Not guaranteed.</div>
                    </div>
                </div>
                <div style="margin-bottom:18px;">
                    <div style="display:flex; gap:12px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:120px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:14px 14px 10px 14px;">
                            <div style="font-size:13px; color:#6c757d;">Cycle Duration</div>
                            <div style="font-size:15px; color:#1a2233; font-weight:500;">${offer.settlementPeriod || '30 days'}</div>
                        </div>
                        <div style="flex:1; min-width:120px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:14px 14px 10px 14px;">
                            <div style="font-size:13px; color:#6c757d;">Inventory Type</div>
                            <div style="font-size:15px; color:#1a2233; font-weight:500;">${offer.inventoryType || 'Electronics'}</div>
                        </div>
                        <div style="flex:1; min-width:120px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:14px 14px 10px 14px;">
                            <div style="font-size:13px; color:#6c757d;">Location</div>
                            <div style="font-size:15px; color:#1a2233; font-weight:500;">${offer.location || 'US'}</div>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:18px;">
                    <div style="font-size:14px; color:#1a2233; font-weight:500; margin-bottom:2px;">Allocation Amount</div>
                    <div style="font-size:16px; color:#2F2CD8; font-weight:600; margin-bottom:2px;" id="allocationAmountDisplay">${formatCurrency(allocationInputValue)}</div>
                </div>
                <div style="display:flex; gap:12px; margin-bottom:18px; flex-wrap:wrap;">
                    <button id="cancelAllocationBtn" style="
                        flex:1; padding:12px 0; background:#e3e6ee; color:#1a2233; border:none; border-radius:8px; font-size:15px; font-weight:500; cursor:pointer;
                        margin-right:0;
                    ">Cancel</button>
                    <button id="confirmAllocationBtn" style="
                        flex:2; padding:12px 0; background:#1a2233; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer;
                        margin-left:0;
                    ">Confirm Allocation</button>
                </div>
                <div id="allocationErrorMsg" style="font-size:13px; color:#d9534f; margin-bottom:8px; display:none;"></div>
                <div id="allocationBalanceMsg" style="font-size:12px; color:#6c757d; margin-bottom:8px;">
                    ${allocationInputValue > availableBalance
                        ? `<span style="color:#d9534f;">Add Funds to Continue</span><br>
                           <span>Your current balance does not meet the minimum allocation.</span>`
                        : ''
                    }
                </div>
                <div style="font-size:11px; color:#6c757d; margin-top:12px; border-top:1px solid #e3e6ee; padding-top:10px;">
                    This participation involves operational and market risk. Returns are not guaranteed and losses are possible.
                </div>
            `;
            // Attach events after content is rendered
            attachEvents();
        }

        function attachEvents() {
            // Allocation preset buttons
            modalContent.querySelectorAll('.allocation-preset-btn').forEach(btn => {
                btn.onclick = function () {
                    selectedPreset = parseFloat(btn.getAttribute('data-amt'));
                    allocationInputValue = selectedPreset;
                    modalContent.querySelector('#allocationInput').value = allocationInputValue;
                    updateContent();
                };
            });
            // Allocation input field
            const allocationInput = modalContent.querySelector('#allocationInput');
            if (allocationInput) {
                allocationInput.oninput = function (e) {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val) || val < allocationPresets[0]) val = allocationPresets[0];
                    if (val > allocationPresets[2]) val = allocationPresets[2];
                    allocationInputValue = val;
                    updateContent();
                };
            }
            // Cancel button
            const cancelBtn = modalContent.querySelector('#cancelAllocationBtn');
            if (cancelBtn) {
                cancelBtn.onclick = function () {
                    modal.remove();
                };
            }
            // Confirm button
            const confirmBtn = modalContent.querySelector('#confirmAllocationBtn');
            if (confirmBtn) {
                confirmBtn.onclick = async function () {
                    if (allocationInputValue < allocationPresets[0]) {
                        modalContent.querySelector('#allocationErrorMsg').textContent = "Allocation must be at least the minimum.";
                        modalContent.querySelector('#allocationErrorMsg').style.display = 'block';
                        return;
                    }
                    if (allocationInputValue > availableBalance) {
                        modalContent.querySelector('#allocationErrorMsg').textContent = "Your available balance is insufficient for this allocation.";
                        modalContent.querySelector('#allocationErrorMsg').style.display = 'block';
                        return;
                    }
                    confirmBtn.disabled = true;
                    confirmBtn.innerHTML = spinnerHtml() + "Processing...";
                    modalContent.querySelector('#allocationErrorMsg').style.display = 'none';

                    try {
                        // Send allocation request
                        const allocationRes = await fetch('https://api.bitveste.com/api/invest', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                offerId: offer.id,
                                amount: allocationInputValue,
                                email: localStorage.getItem('email'),
                                fullName: localStorage.getItem('fullName') || 'Investor',
                                offerName: offer.offerName,
                                storeName: offer.storeName,
                                brand: offer.brand,
                                settlementPeriod: offer.settlementPeriod
                            })
                        });
                        const allocationData = await allocationRes.json();
                        if (!allocationRes.ok || !allocationData || !allocationData.success) {
                            throw new Error(allocationData.message || "Unable to process allocation.");
                        }
                        // Send confirmation mail
                        await fetch('https://api.bitveste.com/api/send-confirmation-mail', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: localStorage.getItem('email'),
                                offerId: offer.id,
                                offerName: offer.offerName,
                                fullName: (localStorage.getItem('fullName') || 'Investor'),
                                amount: allocationInputValue,
                                allocationId: allocationData.allocationId || allocationData.id || '123456789'
                            })
                        });
                        // Send in-app notification
                        await fetch('https://api.bitveste.com/api/notify', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: localStorage.getItem('email'),
                                title: "Allocation Created",
                                body: `Your allocation of ${formatCurrency(allocationInputValue)} for offer ${offer.offerName || offer.id} was successful.`,
                                timestamp: Date.now()
                            })
                        });
                        // Success: close popup and redirect
                        modal.remove();
                        window.location.href = `allocation-created.html?id=${allocationData.allocationId || allocationData.id || '123456789'}`;
                    } catch (err) {
                        confirmBtn.innerHTML = "Failed. Try Again";
                        confirmBtn.disabled = false;
                        modalContent.querySelector('#allocationErrorMsg').textContent = err.message || "Unable to process allocation. Please try again.";
                        modalContent.querySelector('#allocationErrorMsg').style.display = 'block';
                    }
                };
            }
        }

        fetchAndSyncAuthenticatedUser();
        updateContent();
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    // Start rendering offers on load
    startOffers();
}

// ACTIVE INVESTMENTS AND TRANSACTION HISTORY
// INCLUDED IN dashboard.js FOR SIMPLICITY

// Wrap the dashboard data logic in a single callable function
    function renderActiveInvestmentsAndTransactions() {
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            if (isNaN(date)) return '—';
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Helper to extract the first number from a string like "30 - 60 days"
        function extractCycleDays(cycleStr) {
            if (!cycleStr) return 30; // default
            const match = String(cycleStr).match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 30;
        }

        // Map transaction category to icon and color
        function getCategoryIcon(category) {
            switch ((category || '').toLowerCase()) {
                case 'deposit':
                    return { icon: `<i class="fi fi-rr-arrow-down-left" style="color:#22c55e;"></i>`, color: 'text-success', sign: '+' };
                case 'withdrawal':
                    return { icon: `<i class="fi fi-rr-arrow-up-right" style="color:#ef4444;"></i>`, color: 'text-danger', sign: '-' };
                case 'transfer':
                    return { icon: `<i class="fi fi-rr-arrow-up-right-from-square" style="color:#2563eb;"></i>`, color: 'text-primary', sign: '-' };
                case 'investment':
                    return { icon: `<i class="fi fi-rr-briefcase" style="color:#a21caf;"></i>`, color: 'text-purple', sign: '-' };
                case 'profit':
                    return { icon: `<i class="fi fi-rr-chart-histogram" style="color:#16a34a;"></i>`, color: 'text-success', sign: '+' };
                case 'refund':
                    return { icon: `<i class="fi fi-rr-undo" style="color:#f59e42;"></i>`, color: 'text-warning', sign: '+' };
                default:
                    return { icon: `<i class="fi fi-rr-question"></i>`, color: '', sign: '' };
            }
        }

        // Calculate net potential earnings range for an investment
        function getEarningsRangeForInvestment(inv) {
            // Find offer details by offerId
            const offers = JSON.parse(localStorage.getItem('investmentOffers') || '[]');
            const offer = offers.find(o => String(o.id) === String(inv.offerId || inv.id));
            if (!offer) return '—';

            // Get minimum allocation and current allocation
            const minAllocation = parseFloat(offer.minimumContribution || '0');
            const currentAllocation = parseFloat(inv.amount || minAllocation);

            // Get base earnings min/max from offer
            let baseEarningsMin = 0, baseEarningsMax = 0;
            let currencySymbol = '$';
            const primaryCurrency = (localStorage.getItem('primaryCurrency') || 'USD').toUpperCase();
            if (primaryCurrency === 'GBP') currencySymbol = '£';
            if (primaryCurrency === 'EUR') currencySymbol = '€';

            if (offer.estimatedNetEarnings) {
                // If estimatedNetEarnings is a string like "$3000 – $6000"
                let match = String(offer.estimatedNetEarnings).match(/(\d+)[^\d]+(\d+)/);
                if (match) {
                    baseEarningsMin = parseFloat(match[1]);
                    baseEarningsMax = parseFloat(match[2]);
                }
            } else if (offer.potentialNetEarnings) {
                let match = String(offer.potentialNetEarnings).match(/(\d+)[^\d]+(\d+)/);
                if (match) {
                    baseEarningsMin = parseFloat(match[1]);
                    baseEarningsMax = parseFloat(match[2]);
                }
            }

            if (baseEarningsMin && baseEarningsMax && minAllocation) {
                // Calculate multiplier
                let multiplier = currentAllocation / minAllocation;
                let min = baseEarningsMin * multiplier;
                let max = baseEarningsMax * multiplier;
                return `${currencySymbol}${min.toLocaleString(undefined, {maximumFractionDigits:2})} – ${currencySymbol}${max.toLocaleString(undefined, {maximumFractionDigits:2})}`;
            }
            return offer.estimatedNetEarnings || offer.potentialNetEarnings || '—';
        }

        // Active Investments
        let investmentsRaw;
        try {
            const raw = localStorage.getItem('activeInvestments');
            investmentsRaw = (raw && raw !== "undefined") ? JSON.parse(raw) : [];
        } catch (e) {
            investmentsRaw = [];
        }
        // If not an array, show nothing (leave as is)
        if (!Array.isArray(investmentsRaw)) return;

        const investments = Array.isArray(investmentsRaw) ? investmentsRaw.filter(i => i && typeof i === 'object') : [];
        const activeInvestmentsCard = document.getElementById('activeInvestmentsCard');

        if (activeInvestmentsCard) {
            if (!Array.isArray(investmentsRaw) || investments.length === 0) {
                activeInvestmentsCard.innerHTML = `
                    <div class="card-header"><h4 class="card-title">Active Investments</h4></div>
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="fi fi-rr-inbox text-4xl text-gray-400"></i>
                            <p class="mt-3 mb-0 text-muted">No active investments found.</p>
                        </div>
                    </div>
                `;
            } else {
                activeInvestmentsCard.innerHTML = `
                    <div class="card-header"><h4 class="card-title">Active Investments</h4></div>
                    <div class="card-body">
                        <div class="budget-content">
                            <ul>
                                ${investments.map(inv => {
                                    const start = new Date(inv.createdAt).getTime();
                                    const cycleStr = inv.settlementPeriod || inv.cycleDuration || inv.duration || '';
                                    const cycleDays = extractCycleDays(cycleStr);
                                    const end = start + cycleDays * 24 * 60 * 60 * 1000;
                                    const now = Date.now();

                                    let percent = 0;
                                    let progressText = '';

                                    if (end > start) {
                                        percent = Math.min(
                                            100,
                                            Math.max(0, ((now - start) / (end - start)) * 100)
                                        );
                                        progressText = `${percent.toFixed(0)}%`;
                                    } else {
                                        percent = 100;
                                        progressText = '100%';
                                    }

                                    const brandImg = inv.brand
                                        ? `<img src="images/brands/${inv.brand}.svg" alt="${inv.brand}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;">`
                                        : '';

                                    // Calculate net potential earnings range
                                    const earningsRange = getEarningsRangeForInvestment(inv);

                                    return `
                                        <li>
                                            <div class="budget-info flex-grow-2 me-3">
                                                <div class="d-flex justify-content-between align-items-center mb-1">
                                                    <h5 class="mb-1" style="display:flex;align-items:center;">
                                                        ${brandImg}
                                                        ${inv.brand || '—'}
                                                    </h5>
                                                    <p class="mb-0">
                                                        <strong>${inv.amount?.toLocaleString() || '—'}</strong> USD
                                                    </p>
                                                </div>

                                                <div class="small mb-1">
                                                    <span style="display:block;"><strong>Started:</strong> ${formatDate(inv.createdAt)}</span>
                                                    <span style="display:block;"><strong>ID:</strong> ${inv.allocationId || '—'}</span>
                                                    <span style="display:block;"><strong>Net Potential Earnings:</strong> ${earningsRange}</span>
                                                </div>

                                                <div class="d-flex justify-content-between align-items-center mb-1">
                                                    <span class="small text-muted">Progress:</span>
                                                    <span class="small text-muted">${progressText}</span>
                                                </div>

                                                <div class="progress mb-2">
                                                    <div class="progress-bar bg-indigo-500" role="progressbar" style="width: ${percent}%;"></div>
                                                </div>
                                            </div>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
            // 🔁 UPDATE SCROLL AFTER DYNAMIC RENDER
            window.psBudget?.update();
        }

        // Transaction History
        let transactions;
        try {
            const raw = localStorage.getItem('transactionHistory');
            transactions = (raw && raw !== "undefined") ? JSON.parse(raw) : [];
        } catch (e) {
            transactions = [];
        }
        // If not an array, show nothing (leave as is)
        if (!Array.isArray(transactions)) return;

        const transactionTableBody = document.getElementById('transactionTableBody');

        if (transactionTableBody) {
            if (!Array.isArray(transactions) || transactions.length === 0) {
                transactionTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-5">
                            <i class="fi fi-rr-inbox text-4xl text-gray-400"></i>
                            <div class="mt-2 text-muted">No transactions found.</div>
                        </td>
                    </tr>
                `;
            } else {
                transactionTableBody.innerHTML = transactions.map(tx => {
                    const { icon, color, sign } = getCategoryIcon(tx.category);
                    const isPositive = sign === '+';
                    const amountStr = typeof tx.amount === 'number'
                        ? `${isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : '—';
                    return `
                        <tr>
                            <td>
                                <span class="table-category-icon ${color}">
                                    ${icon}
                                    ${tx.category || '—'}
                                </span>
                            </td>
                            <td>${formatDate(tx.date)}</td>
                            <td>${tx.description || '—'}</td>
                            <td class="${color}">${amountStr}</td>
                            <td>${tx.transactionId || '—'}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

///////////
//UPDATE NOTIFY BADGE//
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
///////////////////
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    fetchAndSyncAuthenticatedUser();
  }
});


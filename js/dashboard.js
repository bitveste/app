// FUNCTION TO HANDLE AUTHENTICATION VIA MAGIC LINK TOKENS AND FETCHING USER DATA
// THIS IS PART OF GENERAL CODE FOR ALL PAGES REQUIRING AUTHENTICATION
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

// Call handleMagicLinkLoginToken before anything else
document.addEventListener("DOMContentLoaded", handleMagicLinkLoginToken);
    
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

                            (function () {
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

                                // Main logic
                                const offersListEl = document.getElementById('dynamicOffersList');
                                let offers = [];
                                let currentIndex = 0;
                                const PAGE_SIZE = 10;

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
                                }

                                function initOffers() {
                                    offersListEl.innerHTML = '';
                                    offers = loadOffersFromLocalStorage();
                                    if (!offers.length) {
                                        offersListEl.innerHTML = '<li class="text-center text-muted py-4">No investment offers found.</li>';
                                        document.getElementById('loadMoreOffersBtn').style.display = 'none';
                                        return;
                                    }
                                    offers = shuffle(offers);
                                    currentIndex = 0;
                                    renderNextOffers();
                                }

                                const loadMoreBtn = document.getElementById('loadMoreOffersBtn');
                                if (loadMoreBtn) {
                                    loadMoreBtn.addEventListener('click', renderNextOffers);
                                }

                                // Run on DOMContentLoaded and when user data is synced
                                document.addEventListener('DOMContentLoaded', initOffers);
                                document.addEventListener('userDataSynced', initOffers);

                                // Attach Invest Now button events
                                function attachInvestNowEvents() {
                                    document.querySelectorAll('.invest-now-btn').forEach(btn => {
                                        btn.onclick = function (e) {
                                            e.preventDefault();
                                            const offerId = btn.getAttribute('data-offer-id');
                                            const offer = offers.find(o => String(o.id) === String(offerId));
                                            if (offer) showAllocationPopup(offer);
                                        };
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
                                                        ${allocationPresets.map((amt, idx) => `
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
                                            <div style="margin-top:24px; background:#fff; border-radius:10px; border:1px solid #e3e6ee; padding:18px;">
                                                <div style="font-size:15px; color:#1a2233; font-weight:600; margin-bottom:8px;">Offer Details</div>
                                                <div style="font-size:13px; color:#444; margin-bottom:6px;"><strong>Store:</strong> ${offer.storeName || 'N/A'}</div>
                                                <div style="font-size:13px; color:#444; margin-bottom:6px;"><strong>Brand:</strong> ${offer.brand || 'N/A'}</div>
                                                <div style="font-size:13px; color:#444; margin-bottom:6px;"><strong>Risk Disclosure:</strong> ${offer.riskDisclosure || 'N/A'}</div>
                                            </div>
                                        `;
                                    }

                                    function attachEvents() {
                                        // Allocation preset buttons
                                        modalContent.querySelectorAll('.allocation-preset-btn').forEach(btn => {
                                            btn.onclick = function () {
                                                selectedPreset = parseFloat(btn.getAttribute('data-amt'));
                                                allocationInputValue = selectedPreset;
                                                modalContent.querySelector('#allocationInput').value = allocationInputValue;
                                                updateContent();
                                                attachEvents();
                                            };
                                        });
                                        // Allocation input field
                                        const allocationInput = modalContent.querySelector('#allocationInput');
                                        allocationInput.oninput = function (e) {
                                            let val = parseFloat(e.target.value);
                                            if (isNaN(val) || val < allocationPresets[0]) val = allocationPresets[0];
                                            if (val > allocationPresets[2]) val = allocationPresets[2];
                                            allocationInputValue = val;
                                            updateContent();
                                            attachEvents();
                                        };
                                        // Cancel button
                                        modalContent.querySelector('#cancelAllocationBtn').onclick = function () {
                                            modal.remove();
                                        };
                                        // Confirm button
                                        const confirmBtn = modalContent.querySelector('#confirmAllocationBtn');
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

                                    updateContent();
                                    attachEvents();
                                    modal.appendChild(modalContent);
                                    document.body.appendChild(modal);
                                }
                            })();

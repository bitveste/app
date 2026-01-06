//HEADER FUNCTIONS
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
        updateStatsSettingsProfile();
        forceAvatarFromLocalStorage2();
        setProfileValuesFromLocalStorage()

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

//FUNCTIONS FOR SETTINGS-PROFILE.HTML PAGE
// FUNCTION TO UPDATE PROFILE STATS FROM LOCALSTORAGE FOR SETTINGS-PROFILE.HTML PAGE
function updateStatsSettingsProfile() {
    const fullName = localStorage.getItem('fullName') || 'New User';
    const email = localStorage.getItem('email') || 'user@example.com';
    const userId = localStorage.getItem('userId') || '';
    const createdAt = localStorage.getItem('createdAt') || '';

    document.querySelectorAll('#emailDisplay3, #emailDisplay4').forEach(el => { el.textContent = email; });
    document.querySelectorAll('#fullNameDisplay3, #fullNameDisplay5').forEach(el => { el.textContent = fullName; });

    // INPUT FIELD (value, not textContent)
    const emailInput = document.getElementById('emailDisplay5');
    if (emailInput) {
        emailInput.value = email;
    }

    // UID and Date Created displays
    const userIdDisplay = document.getElementById('userIdDisplay');
    if (userIdDisplay) {
        userIdDisplay.value = userId;
    }

    const createdAtDisplay = document.getElementById('createdAtDisplay');
    if (createdAtDisplay) {
        createdAtDisplay.value = new Date(parseInt(createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    updateStatsSettingsProfile();
});

function forceAvatarFromLocalStorage2() {
    const img2 = document.getElementById('avatarPreview2');
    const avatar = localStorage.getItem('avatar');
    if (img2 && avatar) {
        img2.src = avatar;
    } else if (!img2) {
        console.warn("Element with id 'avatarPreview2' not found in DOM.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    forceAvatarFromLocalStorage2();
});

        /* ===============================
        MESSAGE DISPLAY FUNCTION
        ================================ */
        function showMessage(message, isError = false) {
            const messageBox = document.getElementById("message");
            if (!messageBox) return;
            
            const icon = isError 
                ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>' 
                : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            
            messageBox.innerHTML = `${icon} ${message}`;
            messageBox.className = isError ? 'error' : 'success';
            messageBox.classList.add('show');
            
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 5000);
        }
        /* ===============================
        SET VALUES FROM LOCALSTORAGE
        ================================ */
        function setProfileValuesFromLocalStorage() {
            document.getElementById('fullNameDisplay6').value =
                localStorage.getItem('fullName') || '';

            const dateOfBirth = localStorage.getItem('dateOfBirth');
            if (dateOfBirth) {
                const date = new Date(parseInt(dateOfBirth));
                const formattedDate = date.toISOString().split('T')[0];
                document.getElementById('dateOfBirthDisplay').value = formattedDate;
            }

            document.getElementById('addressDisplay').value =
                localStorage.getItem('address') || '';

            document.getElementById('cityDisplay').value =
                localStorage.getItem('city') || '';

            document.getElementById('postalDisplay').value =
                localStorage.getItem('postCode') || '';

            document.getElementById('countrySelect').value =
                localStorage.getItem('country') || '';
        }

        /* ===============================
        CONVERT DATE TO TIMESTAMP FOR STORAGE
        ================================ */
        function convertDateToTimestamp(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.getTime().toString();
        }

        /* ===============================
        SUBMIT — SEND ONLY IF CHANGED
        ================================ */
        document.getElementById('profileForms').onsubmit = async (e) => {
            e.preventDefault();

            const currentData = {
                fullName: document.getElementById('fullNameDisplay6').value.trim(),
                dateOfBirth: convertDateToTimestamp(document.getElementById('dateOfBirthDisplay').value),
                address: document.getElementById('addressDisplay').value.trim(),
                city: document.getElementById('cityDisplay').value.trim(),
                postCode: document.getElementById('postalDisplay').value.trim(),
                country: document.getElementById('countrySelect').value
            };

            const storedData = {
                fullName: localStorage.getItem('fullName') || '',
                dateOfBirth: localStorage.getItem('dateOfBirth') || '',
                address: localStorage.getItem('address') || '',
                city: localStorage.getItem('city') || '',
                postCode: localStorage.getItem('postCode') || '',
                country: localStorage.getItem('country') || ''
            };

            let hasChanged = false;
            for (const key in currentData) {
                if (currentData[key] !== storedData[key]) {
                    hasChanged = true;
                    break;
                }
            }

            if (!hasChanged) {
                showMessage('No changes detected.', false);
                return;
            }

            try {
                const response = await fetch(
                    'https://api.bitveste.com/api/users/update',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('loginToken')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...currentData,
                            email: localStorage.getItem('email')
                        })
                    }
                );

                if (response.ok) {
                    Object.keys(currentData).forEach(key => {
                        localStorage.setItem(key, currentData[key]);
                    });

                    setProfileValuesFromLocalStorage();
                    if (typeof updateStatsSettingsProfile === 'function') {
                        fetchAndSyncAuthenticatedUser();
                    }

                    showMessage('Profile updated successfully', false);
                } else {
                    showMessage('Failed to update profile', true);
                }
            } catch (error) {
                showMessage('Error updating profile: ' + error.message, true);
            }
        };

        /* ===============================
        PREVENT FORM RESUBMISSION ON RELOAD
        ================================ */
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }

        /* ===============================
        INIT
        ================================ */
        document.addEventListener('DOMContentLoaded', () => {
            setProfileValuesFromLocalStorage();
        });

        /* ===============================
        FIREBASE AVATAR UPLOAD
        =============================== */
        const firebaseConfig = {
            apiKey: "AIzaSyDVU8ZZzm3ZqKIXEYBSMr6Mt_IeoAV4bNE",
            authDomain: "bitveste-1.firebaseapp.com",
            projectId: "bitveste-1",
            storageBucket: "bitveste-1.firebasestorage.app",
            messagingSenderId: "41684574886",
            appId: "1:41684574886:web:ae262bd817166aa6714a67"
        };

        // Load Firebase SDK dynamically if not present
        (function() {
            if (!window.firebaseAppLoaded) {
                const script1 = document.createElement('script');
                script1.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
                document.head.appendChild(script1);

                const script2 = document.createElement('script');
                script2.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js";
                document.head.appendChild(script2);

                window.firebaseAppLoaded = true;
            }
        })();

        function waitForFirebaseCompat(callback) {
            const check = () => {
                if (window.firebase && window.firebase.storage) {
                    callback();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        }

        document.addEventListener("DOMContentLoaded", () => {
            waitForFirebaseCompat(() => {
                const app = window.firebase.initializeApp(firebaseConfig);
                const storage = window.firebase.storage().ref();

                const fileInput = document.getElementById("customFile");
                const saveBtn = document.getElementById("saveAvatarBtn");
                const avatarImg = document.getElementById("avatarPreview2");

                if (!fileInput || !saveBtn || !avatarImg) {
                    showMessage("Required elements not found", true);
                    return;
                }

                saveBtn.addEventListener("click", async () => {
                    const file = fileInput.files[0];

                    if (!file) {
                        showMessage("Please select an image", true);
                        return;
                    }

                    if (!file.type.startsWith("image/")) {
                        showMessage("Only image files allowed", true);
                        return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                        showMessage("File size exceeds 5MB limit", true);
                        return;
                    }

                    const filePath = `avatars/public/${Date.now()}-${file.name}`;
                    const storageRef = storage.child(filePath);

                    try {
                        saveBtn.disabled = true;
                        showMessage("Uploading...");

                        const uploadTask = storageRef.put(file);

                        uploadTask.on(
                            "state_changed",
                            null,
                            (error) => {
                                showMessage("Upload failed: " + error.message, true);
                                saveBtn.disabled = false;
                            },
                            async () => {
                                const url = await uploadTask.snapshot.ref.getDownloadURL();
                                const loginToken = localStorage.getItem("loginToken");

                                if (!loginToken) {
                                    showMessage("You must be logged in", true);
                                    saveBtn.disabled = false;
                                    return;
                                }

                                avatarImg.src = url;

                                const response = await fetch("https://api.bitveste.com/api/profile/avatar", {
                                    method: "POST",
                                    headers: { 
                                        'Authorization': `Bearer ${loginToken}`,
                                        'Content-Type': 'application/json' 
                                    },
                                    body: JSON.stringify({ avatarUrl: url })
                                });

                                if (response.ok) {
                                    fetchAndSyncAuthenticatedUser();
                                    showMessage("Profile picture updated successfully");
                                } else {
                                    showMessage("Failed to update profile picture", true);
                                }

                                saveBtn.disabled = false;
                            }
                        );
                    } catch (err) {
                        showMessage("Error: " + err.message, true);
                        saveBtn.disabled = false;
                    }
                });
            });
        });
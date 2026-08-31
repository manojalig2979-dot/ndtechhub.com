// js/admin.js — Google Authentication & Admin Dashboard Gateway
import { auth, isAdmin, ADMIN_EMAILS } from "./firebase-auth.js";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. DOM Elements ───────────────────────────────────────────────────────
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const googleLoginBtn = document.getElementById('adminGoogleLoginBtn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-msg');
    const loadingBox = document.getElementById('auth-loading-box');
    const userAvatar = document.getElementById('admin-user-avatar');
    const userName = document.getElementById('admin-user-name');
    const userEmail = document.getElementById('admin-user-email');

    // ── 2. Helper Display Functions ───────────────────────────────────────────
    function showError(message) {
        if (loadingBox) loadingBox.style.display = 'none';
        if (errorBox && errorMsg) {
            errorMsg.textContent = message;
            errorBox.style.display = 'block';
        }
    }

    function clearError() {
        if (errorBox) errorBox.style.display = 'none';
        if (loadingBox) loadingBox.style.display = 'none';
    }

    function showLoading(show = true) {
        if (loadingBox) loadingBox.style.display = show ? 'block' : 'none';
        if (show && errorBox) errorBox.style.display = 'none';
        if (googleLoginBtn) googleLoginBtn.disabled = show;
    }

    function showDashboard(user) {
        if (authSection) authSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        
        // Update user badge
        if (userName) userName.textContent = user.displayName || 'Manoj Singh';
        if (userEmail) userEmail.textContent = user.email || 'manoj.alig2979@gmail.com';
        if (userAvatar) {
            userAvatar.src = user.photoURL || 'assets/logos/ndtechhub.png';
            userAvatar.onerror = () => { userAvatar.src = 'assets/logos/ndtechhub.png'; };
        }

        initInvoiceDate();
        renderTestimonials();
        initGroqAdminConfig();

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function hideDashboard() {
        if (dashboardSection) dashboardSection.style.display = 'none';
        if (authSection) authSection.style.display = 'block';
    }

    // ── 3. Google Sign-In Handler ─────────────────────────────────────────────
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            clearError();
            showLoading(true);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                if (!isAdmin(user)) {
                    // Sign out immediately if unauthorized
                    await signOut(auth);
                    showLoading(false);
                    showError(`Account "${user.email}" is not authorized for Admin Console Gateway. Please sign in with an authorized account (manoj.alig2979@gmail.com).`);
                    return;
                }

                showLoading(false);
                showDashboard(user);
            } catch (err) {
                showLoading(false);
                console.error('[NDTechHub Admin] Auth Error:', err);
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    showError(err.message || 'Failed to authenticate with Google. Please try again.');
                }
            }
        });
    }

    // ── 4. Firebase Auth State Observer ───────────────────────────────────────
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (isAdmin(user)) {
                clearError();
                showDashboard(user);
            } else {
                hideDashboard();
                showError(`Account "${user.email}" is not authorized. Please switch to manoj.alig2979@gmail.com.`);
            }
        } else {
            hideDashboard();
        }
    });

    // ── 5. Logout Handler ─────────────────────────────────────────────────────
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                hideDashboard();
            } catch (err) {
                console.error('[NDTechHub Admin] Logout Error:', err);
            }
        });
    }

    // ── 6. Invoice Generator Logic ────────────────────────────────────────────
    let invoiceItems = [];
    
    const clientNameInput = document.getElementById('clientName');
    const clientGstInput = document.getElementById('clientGst');
    const advanceInput = document.getElementById('advancePayment');
    const includeGstCheck = document.getElementById('includeGstCheck');
    
    // Bind real-time updates for client info
    if (clientNameInput) {
        clientNameInput.addEventListener('input', (e) => {
            const el = document.getElementById('invClientName');
            if (el) el.textContent = e.target.value || '---';
        });
    }
    if (clientGstInput) {
        clientGstInput.addEventListener('input', (e) => {
            const el = document.getElementById('invClientGst');
            if (el) el.textContent = e.target.value || '---';
        });
    }
    if (advanceInput) advanceInput.addEventListener('input', renderInvoice);
    if (includeGstCheck) includeGstCheck.addEventListener('change', renderInvoice);

    const addInvoiceItemBtn = document.getElementById('addInvoiceItemBtn');
    if (addInvoiceItemBtn) {
        addInvoiceItemBtn.addEventListener('click', () => {
            const select = document.getElementById('itemTypeSelect');
            const descOverride = document.getElementById('itemDescOverride').value;
            const costOverride = parseFloat(document.getElementById('itemCostOverride').value);
            
            let desc = descOverride || select.options[select.selectedIndex].text.split(' (₹')[0];
            let cost = isNaN(costOverride) ? parseFloat(select.options[select.selectedIndex].dataset.price) : costOverride;
            
            if (desc && !isNaN(cost)) {
                invoiceItems.push({ description: desc, amount: cost });
                document.getElementById('itemDescOverride').value = '';
                renderInvoice();
            }
        });
    }

    const clearInvoiceBtn = document.getElementById('clearInvoiceBtn');
    if (clearInvoiceBtn) {
        clearInvoiceBtn.addEventListener('click', () => {
            invoiceItems = [];
            if (clientNameInput) clientNameInput.value = '';
            if (clientGstInput) clientGstInput.value = '';
            if (advanceInput) advanceInput.value = '';
            const invClient = document.getElementById('invClientName');
            const invGst = document.getElementById('invClientGst');
            if (invClient) invClient.textContent = '---';
            if (invGst) invGst.textContent = '---';
            renderInvoice();
        });
    }

    const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
    if (saveInvoiceBtn) {
        saveInvoiceBtn.addEventListener('click', () => {
            const element = document.getElementById('printableInvoiceScope');
            const invNum = document.getElementById('invNumber')?.textContent || 'Invoice';
            const opt = {
                margin:       0,
                filename:     `NDTechHub_Invoice_${invNum}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            if (typeof html2pdf !== 'undefined' && element) {
                html2pdf().set(opt).from(element).save();
            } else {
                window.print();
            }
        });
    }

    function initInvoiceDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const invDateEl = document.getElementById('invDate');
        const invNumEl = document.getElementById('invNumber');
        if (invDateEl) invDateEl.textContent = `${dd}/${mm}/${yyyy}`;
        if (invNumEl) invNumEl.textContent = `INV-${yyyy}${mm}${dd}-${Math.floor(Math.random() * 900) + 100}`;
    }

    function renderInvoice() {
        const tbody = document.getElementById('invoiceTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        let subtotal = 0;
        
        invoiceItems.forEach((item, index) => {
            subtotal += item.amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">
                    ${item.description}
                    <button type="button" onclick="window.removeInvoiceItem(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:12px; margin-left:10px;" class="no-print">[x]</button>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-weight: 500;">₹${item.amount.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

        // Calculations
        let gst = 0;
        if (includeGstCheck && includeGstCheck.checked) {
            gst = subtotal * 0.18;
            const gstRow = document.getElementById('gstSummaryRow');
            if (gstRow) gstRow.style.display = 'flex';
        } else {
            const gstRow = document.getElementById('gstSummaryRow');
            if (gstRow) gstRow.style.display = 'none';
        }

        let grandTotal = subtotal + gst;
        let advance = parseFloat(advanceInput?.value) || 0;
        let balance = grandTotal - advance;

        // Display
        const subtotalEl = document.getElementById('summarySubtotal');
        const gstEl = document.getElementById('summaryGst');
        const grandTotalEl = document.getElementById('summaryGrandTotal');
        const advanceEl = document.getElementById('summaryAdvance');
        const balanceEl = document.getElementById('summaryBalance');

        if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
        if (gstEl) gstEl.textContent = gst.toFixed(2);
        if (grandTotalEl) grandTotalEl.textContent = grandTotal.toFixed(2);
        
        const advanceRow = document.getElementById('advanceSummaryRow');
        if (advance > 0) {
            if (advanceRow) advanceRow.style.display = 'flex';
            if (advanceEl) advanceEl.textContent = advance.toFixed(2);
        } else {
            if (advanceRow) advanceRow.style.display = 'none';
        }

        const balanceRow = document.getElementById('balanceSummaryRow');
        if (balanceRow) balanceRow.style.display = 'flex';
        if (balanceEl) balanceEl.textContent = Math.max(0, balance).toFixed(2);

        // Paid in full badge
        const badge = document.getElementById('invoiceStatusBadge');
        const thankNote = document.getElementById('invoiceThankYouNote');
        if (balance <= 0 && grandTotal > 0) {
            if (badge) badge.style.display = 'block';
            if (thankNote) thankNote.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
            if (thankNote) thankNote.style.display = 'none';
        }
    }

    // Expose remove handler to global scope for inline onclick usage
    window.removeInvoiceItem = function(index) {
        invoiceItems.splice(index, 1);
        renderInvoice();
    };

    // ── 7. Ecosystem Feedback Matrix ──────────────────────────────────────────
    function renderTestimonials() {
        const pendingList = document.getElementById('admin-testimonials-list');
        const publishedList = document.getElementById('admin-published-list');
        if (!pendingList || !publishedList) return;

        const mockPending = [
            { name: 'Sarah Jenkins', role: 'Startup Founder', text: 'The Bento layout is phenomenal. Super fast loads!' }
        ];

        const mockPublished = [
            { name: 'Dr. Yudhveer Singh', role: 'Owner, Shanti Medicos', text: 'Working with NDTechHub to build the Shanti Medicos offline app has been a game-changer...' },
            { name: 'Marcus Chen', role: 'Lead Data Scientist', text: 'Their AI integration capabilities completely transformed our data pipeline...' }
        ];

        pendingList.innerHTML = mockPending.map(t => `
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-glass);">
                <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 10px;">"${t.text}"</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong style="color: #fff; font-size: 12px;">${t.name}</strong><br><span style="color: var(--text-muted); font-size: 11px;">${t.role}</span></div>
                    <button class="admin-gate-btn" style="padding: 0.3rem 0.6rem; font-size: 11px;">Publish</button>
                </div>
            </div>
        `).join('');

        publishedList.innerHTML = mockPublished.map(t => `
            <div style="background: rgba(16, 185, 129, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 10px;">"${t.text}"</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong style="color: #fff; font-size: 12px;">${t.name}</strong><br><span style="color: var(--text-muted); font-size: 11px;">${t.role}</span></div>
                    <button class="admin-gate-btn" style="padding: 0.3rem 0.6rem; font-size: 11px; border-color: #ef4444; color: #ef4444 !important; background: transparent;">Unpublish</button>
                </div>
            </div>
        `).join('');
    }

    // ── 8. Groq Neural AI Engine Configuration ────────────────────────────────
    function initGroqAdminConfig() {
        const keyInput = document.getElementById('adminGroqKeyInput');
        const modelSelect = document.getElementById('adminGroqModelSelect');
        const toggleVisibilityBtn = document.getElementById('toggleGroqKeyVisibility');
        const saveBtn = document.getElementById('saveGroqConfigBtn');
        const testBtn = document.getElementById('testGroqConfigBtn');
        const fetchModelsBtn = document.getElementById('fetchGroqModelsBtn');
        const clearBtn = document.getElementById('clearGroqConfigBtn');
        const statusBadge = document.getElementById('admin-bot-status-badge');
        const testResult = document.getElementById('admin-bot-test-result');

        if (!keyInput || !modelSelect) return;

        // Populate initial values
        const currentKey = localStorage.getItem('ndg_groq_api_key') || '';
        const currentModel = localStorage.getItem('ndg_groq_model') || 'llama3-8b-8192';

        keyInput.value = currentKey;
        modelSelect.value = currentModel;
        updateBotStatusBadge(!!currentKey);

        // Toggle Key Visibility
        if (toggleVisibilityBtn) {
            toggleVisibilityBtn.onclick = () => {
                keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
                toggleVisibilityBtn.textContent = keyInput.type === 'password' ? '👁️' : '🙈';
            };
        }

        // Live Model Fetcher from Groq
        async function fetchGroqModels(key, showFeedback = true) {
            if (!key) {
                if (showFeedback) alert('Please enter your Groq API Key first.');
                return;
            }

            if (fetchModelsBtn) {
                fetchModelsBtn.disabled = true;
                fetchModelsBtn.textContent = '⏳ Fetching models...';
            }

            try {
                const res = await fetch('https://api.groq.com/openai/v1/models', {
                    headers: { 'Authorization': `Bearer ${key}` }
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error?.message || `HTTP ${res.status}`);
                }

                const data = await res.json();
                const models = (data?.data || [])
                    .map(m => m.id)
                    .filter(id => !id.includes('whisper') && !id.includes('guard') && !id.includes('tts'))
                    .sort();

                if (models.length > 0) {
                    const prevVal = modelSelect.value || currentModel;
                    modelSelect.innerHTML = models.map(id => `
                        <option value="${id}" ${id === prevVal ? 'selected' : ''}>${id}</option>
                    `).join('');

                    if (!models.includes(prevVal)) {
                        modelSelect.value = models[0];
                    }

                    if (showFeedback && testResult) {
                        testResult.style.display = 'block';
                        testResult.style.background = 'rgba(0, 242, 254, 0.08)';
                        testResult.style.border = '1px solid rgba(0, 242, 254, 0.3)';
                        testResult.innerHTML = `✅ Successfully retrieved <strong>${models.length} active models</strong> from your Groq account!`;
                    }
                }
            } catch (err) {
                console.error('[NDTechHub] Failed to fetch Groq models:', err);
                if (showFeedback && testResult) {
                    testResult.style.display = 'block';
                    testResult.style.background = 'rgba(239, 68, 68, 0.12)';
                    testResult.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                    testResult.innerHTML = `<strong style="color:#ef4444;">Could not load model list:</strong> ${err.message}`;
                }
            } finally {
                if (fetchModelsBtn) {
                    fetchModelsBtn.disabled = false;
                    fetchModelsBtn.textContent = '🔄 Sync Models from Groq';
                }
            }
        }

        if (fetchModelsBtn) {
            fetchModelsBtn.onclick = () => {
                const key = keyInput.value.trim() || localStorage.getItem('ndg_groq_api_key');
                fetchGroqModels(key, true);
            };
        }

        function updateBotStatusBadge(active) {
            if (!statusBadge) return;
            if (active) {
                statusBadge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 8px #00f2fe;"></span> Groq AI Engine Active`;
                statusBadge.style.borderColor = 'rgba(0,242,254,0.4)';
                statusBadge.style.color = '#00f2fe';
            } else {
                statusBadge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;"></span> Local Knowledge Mode (No Key)`;
                statusBadge.style.borderColor = 'rgba(255,255,255,0.15)';
                statusBadge.style.color = 'rgba(255,255,255,0.6)';
            }
        }

        // Save Configuration
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                const key = keyInput.value.trim();
                const model = modelSelect.value;

                if (key) {
                    localStorage.setItem('ndg_groq_api_key', key);
                } else {
                    localStorage.removeItem('ndg_groq_api_key');
                }
                localStorage.setItem('ndg_groq_model', model);

                updateBotStatusBadge(!!key);
                alert(key ? `✅ Groq AI Engine configuration saved (${model})! Active across the website.` : 'ℹ️ Groq API key removed. Switched to local fallback mode.');
            };
        }

        // Clear Configuration
        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Remove the configured Groq API Key?')) {
                    localStorage.removeItem('ndg_groq_api_key');
                    keyInput.value = '';
                    updateBotStatusBadge(false);
                    if (testResult) testResult.style.display = 'none';
                    alert('Groq API Key cleared.');
                }
            };
        }

        // Test Live Groq Connectivity
        if (testBtn) {
            testBtn.onclick = async (e) => {
                e.preventDefault();
                const key = keyInput.value.trim() || localStorage.getItem('ndg_groq_api_key');
                const model = modelSelect.value || 'llama3-8b-8192';

                if (!key) {
                    alert('Please enter a Groq API Key first to run connectivity test.');
                    return;
                }

                testBtn.disabled = true;
                testBtn.innerHTML = `<i data-lucide="loader" style="width:16px;height:16px;"></i> Testing...`;
                if (testResult) {
                    testResult.style.display = 'block';
                    testResult.style.background = 'rgba(0, 242, 254, 0.08)';
                    testResult.style.border = '1px solid rgba(0, 242, 254, 0.3)';
                    testResult.style.color = '#fff';
                    testResult.innerHTML = `⚡ Connecting to Groq Cloud (Model: <strong>${model}</strong>)...`;
                }

                const startTime = performance.now();
                try {
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${key}`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [
                                { role: 'system', content: 'You are NDTechHub Assistant.' },
                                { role: 'user', content: 'Say hello from NDTechHub in 1 concise sentence!' }
                            ],
                            max_tokens: 50
                        })
                    });

                    const elapsed = Math.round(performance.now() - startTime);

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err?.error?.message || `HTTP ${res.status}`);
                    }

                    const data = await res.json();
                    const reply = data?.choices?.[0]?.message?.content || 'Success!';

                    if (testResult) {
                        testResult.style.background = 'rgba(16, 185, 129, 0.12)';
                        testResult.style.border = '1px solid rgba(16, 185, 129, 0.4)';
                        testResult.innerHTML = `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <strong style="color:#10b981;">✅ Groq Cloud Live & Verified!</strong>
                                <span style="font-size:11px; font-family:monospace; color:#10b981;">Latency: ${elapsed}ms (${model})</span>
                            </div>
                            <div style="font-size:12px; color:rgba(255,255,255,0.9);">"${reply}"</div>
                        `;
                    }
                } catch (err) {
                    if (testResult) {
                        testResult.style.background = 'rgba(239, 68, 68, 0.12)';
                        testResult.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                        testResult.innerHTML = `
                            <div style="margin-bottom: 6px;">
                                <strong style="color:#ef4444;">❌ Groq Connection Error:</strong>
                                <div style="font-size:12px; color:rgba(255,255,255,0.85); margin-top:4px;">${err.message}</div>
                            </div>
                            <div style="font-size:11.5px; color:#00f2fe; margin-top:8px; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
                                👉 Click <strong>"🔄 Sync Models from Groq"</strong> above to auto-load the exact models your account has access to.
                            </div>
                        `;
                    }
                } finally {
                    testBtn.disabled = false;
                    testBtn.innerHTML = `<i data-lucide="zap" style="width: 16px; height: 16px;"></i> Test Live AI`;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            };
        }
    }
});

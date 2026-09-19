// js/admin.js — Google Authentication & Admin Dashboard Gateway
import { auth, isAdmin } from "./firebase-auth.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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

        if (userName) userName.textContent = user.displayName || 'Manoj Singh';
        if (userEmail) userEmail.textContent = user.email || 'manoj.alig2979@gmail.com';
        if (userAvatar) {
            userAvatar.src = user.photoURL || 'assets/logos/ndtechhub.webp';
            userAvatar.onerror = () => { userAvatar.src = 'assets/logos/ndtechhub.webp'; };
        }

        initInvoiceDate();
        renderTestimonials();
        initGroqAdminConfig();
        renderRoster();

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

        let gst = 0;
        const gstRow = document.getElementById('gstSummaryRow');
        if (includeGstCheck && includeGstCheck.checked) {
            gst = subtotal * 0.18;
            if (gstRow) gstRow.style.display = 'flex';
        } else {
            if (gstRow) gstRow.style.display = 'none';
        }

        let grandTotal = subtotal + gst;
        let advance = parseFloat(advanceInput?.value) || 0;
        let balance = grandTotal - advance;

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
            <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                <p style="font-size: 13px; color: #f1f5f9; margin-bottom: 10px;">"${t.text}"</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong style="color: #fff; font-size: 12px;">${t.name}</strong><br><span style="color: #94a3b8; font-size: 11px;">${t.role}</span></div>
                    <button class="admin-gate-btn" style="padding: 0.3rem 0.6rem; font-size: 11px;">Publish</button>
                </div>
            </div>
        `).join('');

        publishedList.innerHTML = mockPublished.map(t => `
            <div style="background: rgba(16, 185, 129, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <p style="font-size: 13px; color: #f1f5f9; margin-bottom: 10px;">"${t.text}"</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong style="color: #fff; font-size: 12px;">${t.name}</strong><br><span style="color: #94a3b8; font-size: 11px;">${t.role}</span></div>
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

        const currentKey = localStorage.getItem('ndg_groq_api_key') || '';
        const currentModel = localStorage.getItem('ndg_groq_model') || 'llama3-8b-8192';
        keyInput.value = currentKey;
        modelSelect.value = currentModel;
        updateBotStatusBadge(!!currentKey);

        if (toggleVisibilityBtn) {
            toggleVisibilityBtn.onclick = () => {
                keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
                toggleVisibilityBtn.textContent = keyInput.type === 'password' ? '👁️' : '🙈';
            };
        }

        async function fetchGroqModels(key, showFeedback = true) {
            if (!key) { if (showFeedback) alert('Please enter your Groq API Key first.'); return; }
            if (fetchModelsBtn) { fetchModelsBtn.disabled = true; fetchModelsBtn.textContent = '⏳ Fetching models...'; }
            try {
                const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${key}` } });
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `HTTP ${res.status}`); }
                const data = await res.json();
                const models = (data?.data || []).map(m => m.id).filter(id => !id.includes('whisper') && !id.includes('guard') && !id.includes('tts')).sort();
                if (models.length > 0) {
                    const prevVal = modelSelect.value || currentModel;
                    modelSelect.innerHTML = models.map(id => `<option value="${id}" ${id === prevVal ? 'selected' : ''}>${id}</option>`).join('');
                    if (!models.includes(prevVal)) modelSelect.value = models[0];
                    if (showFeedback && testResult) {
                        testResult.style.display = 'block'; testResult.style.background = 'rgba(0, 242, 254, 0.08)'; testResult.style.border = '1px solid rgba(0, 242, 254, 0.3)';
                        testResult.innerHTML = `✅ Successfully retrieved <strong>${models.length} active models</strong> from your Groq account!`;
                    }
                }
            } catch (err) {
                if (showFeedback && testResult) {
                    testResult.style.display = 'block'; testResult.style.background = 'rgba(239, 68, 68, 0.12)'; testResult.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                    testResult.innerHTML = `<strong style="color:#ef4444;">Could not load model list:</strong> ${err.message}`;
                }
            } finally {
                if (fetchModelsBtn) { fetchModelsBtn.disabled = false; fetchModelsBtn.textContent = '🔄 Sync Models from Groq'; }
            }
        }

        if (fetchModelsBtn) fetchModelsBtn.onclick = () => fetchGroqModels(keyInput.value.trim() || localStorage.getItem('ndg_groq_api_key'), true);

        function updateBotStatusBadge(active) {
            if (!statusBadge) return;
            if (active) {
                statusBadge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 8px #00f2fe;"></span> Groq AI Engine Active`;
                statusBadge.style.borderColor = 'rgba(0,242,254,0.4)'; statusBadge.style.color = '#00f2fe';
            } else {
                statusBadge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;"></span> Local Knowledge Mode (No Key)`;
                statusBadge.style.borderColor = 'rgba(255,255,255,0.15)'; statusBadge.style.color = 'rgba(255,255,255,0.6)';
            }
        }

        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.preventDefault();
                const key = keyInput.value.trim(); const model = modelSelect.value;
                if (key) { localStorage.setItem('ndg_groq_api_key', key); } else { localStorage.removeItem('ndg_groq_api_key'); }
                localStorage.setItem('ndg_groq_model', model);
                updateBotStatusBadge(!!key);
                alert(key ? `✅ Groq AI Engine configuration saved (${model})!` : 'ℹ️ Groq API key removed. Switched to local fallback mode.');
            };
        }
        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Remove the configured Groq API Key?')) { localStorage.removeItem('ndg_groq_api_key'); keyInput.value = ''; updateBotStatusBadge(false); if (testResult) testResult.style.display = 'none'; alert('Groq API Key cleared.'); }
            };
        }
        if (testBtn) {
            testBtn.onclick = async (e) => {
                e.preventDefault();
                const key = keyInput.value.trim() || localStorage.getItem('ndg_groq_api_key');
                const model = modelSelect.value || 'llama3-8b-8192';
                if (!key) { alert('Please enter a Groq API Key first.'); return; }
                testBtn.disabled = true; testBtn.innerHTML = `<i data-lucide="loader" style="width:16px;height:16px;"></i> Testing...`;
                if (testResult) { testResult.style.display = 'block'; testResult.style.background = 'rgba(0, 242, 254, 0.08)'; testResult.style.border = '1px solid rgba(0, 242, 254, 0.3)'; testResult.style.color = '#fff'; testResult.innerHTML = `⚡ Connecting to Groq Cloud (Model: <strong>${model}</strong>)...`; }
                const startTime = performance.now();
                try {
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }, body: JSON.stringify({ model: model, messages: [{ role: 'system', content: 'You are NDTechHub Assistant.' }, { role: 'user', content: 'Say hello from NDTechHub in 1 concise sentence!' }], max_tokens: 50 }) });
                    const elapsed = Math.round(performance.now() - startTime);
                    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `HTTP ${res.status}`); }
                    const data = await res.json(); const reply = data?.choices?.[0]?.message?.content || 'Success!';
                    if (testResult) { testResult.style.background = 'rgba(16, 185, 129, 0.12)'; testResult.style.border = '1px solid rgba(16, 185, 129, 0.4)'; testResult.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><strong style="color:#10b981;">✅ Groq Cloud Live & Verified!</strong><span style="font-size:11px; font-family:monospace; color:#10b981;">Latency: ${elapsed}ms (${model})</span></div><div style="font-size:12px; color:rgba(255,255,255,0.9);">"${reply}"</div>`; }
                } catch (err) {
                    if (testResult) { testResult.style.background = 'rgba(239, 68, 68, 0.12)'; testResult.style.border = '1px solid rgba(239, 68, 68, 0.4)'; testResult.innerHTML = `<div style="margin-bottom: 6px;"><strong style="color:#ef4444;">❌ Groq Connection Error:</strong><div style="font-size:12px; color:rgba(255,255,255,0.85); margin-top:4px;">${err.message}</div></div>`; }
                } finally {
                    testBtn.disabled = false; testBtn.innerHTML = `<i data-lucide="zap" style="width: 16px; height: 16px;"></i> Test Live AI`;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            };
        }
    }

    // ── 9. HR Employee Roster Engine ──────────────────────────────────────────
    let employees = JSON.parse(localStorage.getItem('ndg_hr_roster')) || [];

    function saveEmployees() {
        localStorage.setItem('ndg_hr_roster', JSON.stringify(employees));
    }

    function renderRoster() {
        const rosterList = document.getElementById('hr-roster-list');
        const docEmpSelect = document.getElementById('docEmpSelect');
        if (!rosterList || !docEmpSelect) return;

        rosterList.innerHTML = '';
        docEmpSelect.innerHTML = '<option value="">-- Choose Employee --</option>';

        employees.forEach((emp, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
            tr.innerHTML = `
                <td style="padding: 12px 16px; font-weight: 500; color: #fff;">${emp.name}<br><span style="font-size:11px; color:#64748b;">${emp.id}</span></td>
                <td style="padding: 12px 16px;">${emp.role}</td>
                <td style="padding: 12px 16px;">₹${Number(emp.salary).toLocaleString()}</td>
                <td style="padding: 12px 16px;">${emp.joinDate}</td>
                <td style="padding: 12px 16px; text-align: right;">
                    <button type="button" onclick="window.removeEmployee(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:12px; font-weight:700;">Remove</button>
                </td>
            `;
            rosterList.appendChild(tr);

            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${emp.name} (${emp.role})`;
            docEmpSelect.appendChild(opt);
        });
    }

    window.removeEmployee = function(index) {
        if (confirm("Remove this employee from the roster?")) {
            employees.splice(index, 1);
            saveEmployees();
            renderRoster();
        }
    };

    const hrAddForm = document.getElementById('hr-add-employee-form');
    if (hrAddForm) {
        hrAddForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newEmp = {
                name: document.getElementById('hrEmpName').value.trim(),
                role: document.getElementById('hrEmpRole').value.trim(),
                id: document.getElementById('hrEmpId').value.trim() || `NDT-${Math.floor(1000 + Math.random() * 9000)}`,
                salary: parseFloat(document.getElementById('hrEmpSalary').value),
                joinDate: document.getElementById('hrEmpDate').value,
                address: document.getElementById('hrEmpAddress').value.trim()
            };
            employees.push(newEmp);
            saveEmployees();
            renderRoster();
            hrAddForm.reset();
        });
    }

    // ── 10. HR Document Forge Logic ──────────────────────────────────────────
    const docGenerateBtn = document.getElementById('docGenerateBtn');
    const docTypeSelect = document.getElementById('docTypeSelect');
    const docBodyInjection = document.getElementById('docBodyInjection');
    const hrDocPreviewWrapper = document.getElementById('hrDocPreviewWrapper');
    const saveDocPdfBtn = document.getElementById('saveDocPdfBtn');

    if (docGenerateBtn) {
        docGenerateBtn.addEventListener('click', () => {
            const empIndex = document.getElementById('docEmpSelect').value;
            if (empIndex === "") { alert("Please select an employee first."); return; }

            const emp = employees[empIndex];
            const docType = docTypeSelect.value;
            const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            let htmlContent = '';

            if (docType === 'offer') {
                htmlContent = `
                    <h2 style="text-align: center; color: #0f172a; margin-bottom: 30px; letter-spacing: 1px;">OFFER OF EMPLOYMENT</h2>
                    <p style="margin-bottom: 20px;"><strong>Date:</strong> ${todayDate}</p>
                    <p style="margin-bottom: 20px;"><strong>To:</strong><br>${emp.name}<br>${emp.address || 'Delhi, India'}</p>
                    <p style="margin-bottom: 20px;">Dear <strong>${emp.name}</strong>,</p>
                    <p style="margin-bottom: 15px;">We are delighted to offer you employment with <strong>NDTechHub</strong> (A unit of NAVDIVA GROUP) in the position of <strong>${emp.role}</strong>.</p>
                    <p style="margin-bottom: 15px;">Your monthly gross compensation will be <strong>₹${Number(emp.salary).toLocaleString()}</strong>. Your expected date of joining is <strong>${emp.joinDate}</strong>. Your Employee ID will be <strong>${emp.id}</strong>.</p>
                    <p style="margin-bottom: 15px;">As part of NDTechHub, you will be expected to observe the highest standards of professional conduct and operational integrity. This offer is subject to successful completion of any background verification and document submission.</p>
                    <p style="margin-bottom: 30px;">Please acknowledge your acceptance of this offer by signing and returning a copy of this letter within 7 working days.</p>
                    <p style="margin-bottom: 4px;">Sincerely,</p>
                    <p><strong>Manoj Singh</strong><br>CEO & Founder, NDTechHub</p>
                `;
            } else if (docType === 'joining') {
                htmlContent = `
                    <h2 style="text-align: center; color: #0f172a; margin-bottom: 30px; letter-spacing: 1px;">JOINING CONFIRMATION LETTER</h2>
                    <p style="margin-bottom: 20px;"><strong>Date:</strong> ${todayDate}</p>
                    <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                        <tr><td style="padding: 6px 0; color: #475569; width: 40%;"><strong>Employee Name:</strong></td><td style="padding: 6px 0;">${emp.name}</td></tr>
                        <tr><td style="padding: 6px 0; color: #475569;"><strong>Employee ID:</strong></td><td style="padding: 6px 0;">${emp.id}</td></tr>
                        <tr><td style="padding: 6px 0; color: #475569;"><strong>Designation:</strong></td><td style="padding: 6px 0;">${emp.role}</td></tr>
                        <tr><td style="padding: 6px 0; color: #475569;"><strong>Date of Joining:</strong></td><td style="padding: 6px 0;">${emp.joinDate}</td></tr>
                        <tr><td style="padding: 6px 0; color: #475569;"><strong>Monthly Salary:</strong></td><td style="padding: 6px 0;">₹${Number(emp.salary).toLocaleString()}</td></tr>
                    </table>
                    <p style="margin-bottom: 15px;">This letter serves as an official confirmation that you have joined <strong>NDTechHub</strong> (A unit of NAVDIVA GROUP) effective <strong>${emp.joinDate}</strong>.</p>
                    <p style="margin-bottom: 15px;">We are excited to welcome you to the team. Your compensation has been registered in the payroll system and will be credited on or before the last working day of each month.</p>
                    <p style="margin-bottom: 30px;">We look forward to a mutually beneficial and rewarding professional relationship.</p>
                    <p style="margin-bottom: 4px;">Best Regards,</p>
                    <p><strong>HR Department</strong><br>NDTechHub</p>
                `;
            } else if (docType === 'experience') {
                htmlContent = `
                    <h2 style="text-align: center; color: #0f172a; margin-bottom: 30px; letter-spacing: 1px;">EXPERIENCE CERTIFICATE</h2>
                    <p style="margin-bottom: 30px; text-align: right;"><strong>Date:</strong> ${todayDate}</p>
                    <h3 style="text-align: center; margin-bottom: 30px; letter-spacing: 2px; color: #334155;">TO WHOMSOEVER IT MAY CONCERN</h3>
                    <p style="margin-bottom: 15px;">This is to certify that <strong>${emp.name}</strong> (Employee ID: <strong>${emp.id}</strong>) has been employed with <strong>NDTechHub</strong> (A unit of NAVDIVA GROUP) in the capacity of <strong>${emp.role}</strong>.</p>
                    <p style="margin-bottom: 15px;">Their tenure with us commenced on <strong>${emp.joinDate}</strong>. During their time with us, we found <strong>${emp.name}</strong> to be diligent, hardworking, and a person of high professional integrity.</p>
                    <p style="margin-bottom: 15px;">We wish them all the best in their future endeavors and have no hesitation in recommending them for any position of responsibility.</p>
                    <p style="margin-bottom: 30px;">This certificate is issued in good faith at the request of the candidate.</p>
                    <p style="margin-bottom: 4px;">For NDTechHub,</p>
                    <p><strong>Manoj Singh</strong><br>CEO & Founder, NDTechHub</p>
                `;
            } else if (docType === 'salary') {
                const monthYear = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                const sal = Number(emp.salary);
                const basic = (sal * 0.50).toFixed(2);
                const hra = (sal * 0.20).toFixed(2);
                const special = (sal * 0.30).toFixed(2);
                htmlContent = `
                    <h2 style="text-align: center; color: #0f172a; margin-bottom: 8px; letter-spacing: 1px;">SALARY SLIP</h2>
                    <h4 style="text-align: center; margin-bottom: 25px; color: #64748b; font-weight: 400;">For the Month of ${monthYear}</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 25px; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
                        <div style="line-height: 1.8;">
                            <p style="margin: 0;"><strong>Employee Name:</strong> ${emp.name}</p>
                            <p style="margin: 0;"><strong>Designation:</strong> ${emp.role}</p>
                        </div>
                        <div style="text-align: right; line-height: 1.8;">
                            <p style="margin: 0;"><strong>Employee ID:</strong> ${emp.id}</p>
                            <p style="margin: 0;"><strong>Date of Joining:</strong> ${emp.joinDate}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                        <thead>
                            <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                                <th style="padding: 12px; text-align: left; font-weight: 600; color: #334155;">Earnings Component</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600; color: #334155;">Amount (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">Basic Salary (50%)</td><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b;">₹${basic}</td></tr>
                            <tr><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">House Rent Allowance (HRA) (20%)</td><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b;">₹${hra}</td></tr>
                            <tr><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">Special Allowances (30%)</td><td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b;">₹${special}</td></tr>
                        </tbody>
                    </table>
                    <div style="display: flex; justify-content: space-between; padding: 15px; border-top: 2px solid #0f172a; background: #f8fafc; border-radius: 0 0 8px 8px;">
                        <strong style="font-size: 1.1rem; color: #0f172a;">Net Payable Salary</strong>
                        <strong style="font-size: 1.1rem; color: #10b981;">₹${sal.toLocaleString()}</strong>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; font-style: italic;">This is a computer-generated salary slip and does not require a physical signature.</p>
                `;
            }

            if (docBodyInjection) docBodyInjection.innerHTML = htmlContent;
            if (hrDocPreviewWrapper) {
                hrDocPreviewWrapper.style.display = 'block';
                setTimeout(() => hrDocPreviewWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
        });
    }

    if (saveDocPdfBtn) {
        saveDocPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('printableDocScope');
            const empIndex = document.getElementById('docEmpSelect').value;
            const empName = empIndex !== '' ? (employees[empIndex]?.name || 'Employee').replace(/\s+/g, '_') : 'Employee';
            const docType = docTypeSelect ? docTypeSelect.value.toUpperCase() : 'DOCUMENT';
            const opt = {
                margin: 0,
                filename: `NDTechHub_${docType}_${empName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            if (typeof html2pdf !== 'undefined' && element) {
                html2pdf().set(opt).from(element).save();
            } else {
                window.print();
            }
        });
    }

});

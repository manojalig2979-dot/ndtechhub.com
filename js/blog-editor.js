// js/blog-editor.js — NDTechHub Admin Blog Publisher & Editor
import { app, storage, database } from "./firebase-init.js";
import { auth, isAdmin } from "./firebase-auth.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import {
    ref as dbRef,
    set,
    push,
    get,
    child,
    update
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. DOM Elements ────────────────────────────────────────────────────────
    const authGate = document.getElementById('editor-auth-gate');
    const formArea = document.getElementById('editor-form-area');
    const openSigninBtn = document.getElementById('open-signin-btn');
    const authErrorMsg = document.getElementById('auth-error-msg');
    const authHeaderArea = document.getElementById('auth-header-area');
    const editorHeading = document.getElementById('editor-heading');

    const titleInput = document.getElementById('post-title');
    const coverInput = document.getElementById('post-cover');
    const coverFileInput = document.getElementById('cover-file-input');
    const uploadBtnLabel = document.getElementById('upload-btn-label');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressPct = document.getElementById('upload-progress-pct');
    const uploadProgressText = document.getElementById('upload-progress-text');
    const coverPreviewContainer = document.getElementById('cover-preview-container');
    const coverPreviewImg = document.getElementById('cover-preview-img');
    const removeCoverBtn = document.getElementById('remove-cover-btn');
    const tagsInput = document.getElementById('post-tags');
    const publishBtn = document.getElementById('publish-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let currentUser = null;
    let quill = null;
    let editingPostId = null;
    let originalCreatedAt = null;

    // ── 2. Initialize Quill Editor ─────────────────────────────────────────────
    if (typeof Quill !== 'undefined') {
        quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Draft your technical perspective, code architecture, or benchmark breakdown here...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }

    // ── 3. Firebase Authentication Handler ─────────────────────────────────────
    onAuthStateChanged(auth, async (user) => {
        if (user && isAdmin(user)) {
            currentUser = user;
            showEditor(user);
            checkEditMode();
        } else if (user && !isAdmin(user)) {
            currentUser = null;
            await signOut(auth);
            showAuthError(`Access Denied: ${user.email} is not registered as an NDTechHub administrator.`);
            showGate();
        } else {
            currentUser = null;
            showGate();
        }
    });

    if (openSigninBtn) {
        openSigninBtn.addEventListener('click', async () => {
            clearAuthError();
            openSigninBtn.disabled = true;
            openSigninBtn.innerHTML = `Signing In...`;
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            try {
                const result = await signInWithPopup(auth, provider);
                if (!isAdmin(result.user)) {
                    await signOut(auth);
                    showAuthError(`Access Denied: ${result.user.email} is not an authorized administrator.`);
                    showGate();
                }
            } catch (err) {
                console.error("Google Sign-In Error:", err);
                if (err.code !== 'auth/popup-closed-by-user') {
                    showAuthError(err.message || "Failed to complete Google Sign-In. Please try again.");
                }
            } finally {
                openSigninBtn.disabled = false;
                openSigninBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                    Sign In with Google
                `;
            }
        });
    }

    function showGate() {
        if (authGate) authGate.style.display = 'flex';
        if (formArea) formArea.style.display = 'none';
        if (authHeaderArea) authHeaderArea.innerHTML = '';
    }

    function showEditor(user) {
        if (authGate) authGate.style.display = 'none';
        if (formArea) formArea.style.display = 'block';

        if (authHeaderArea) {
            authHeaderArea.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${user.photoURL || 'assets/logos/ndtechhub.webp'}" alt="Avatar" style="width:30px; height:30px; border-radius:50%; border:1px solid rgba(0,242,254,0.4);" onerror="this.src='assets/logos/ndtechhub.webp';" />
                    <span style="font-size:12px; color:rgba(255,255,255,0.7); display:none; sm:inline-block;" class="hidden sm:inline">${user.displayName || user.email}</span>
                    <button id="editor-signout-btn" style="padding:5px 12px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; border-radius:8px; cursor:pointer;">
                        Sign Out
                    </button>
                </div>
            `;
            const signoutBtn = document.getElementById('editor-signout-btn');
            if (signoutBtn) {
                signoutBtn.addEventListener('click', async () => {
                    await signOut(auth);
                    window.location.reload();
                });
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function showAuthError(msg) {
        if (authErrorMsg) {
            authErrorMsg.textContent = msg;
            authErrorMsg.style.display = 'block';
        }
    }

    function clearAuthError() {
        if (authErrorMsg) {
            authErrorMsg.textContent = '';
            authErrorMsg.style.display = 'none';
        }
    }

    // ── 4. Firebase Storage Cover Upload ───────────────────────────────────────
    if (coverFileInput) {
        coverFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file (PNG, JPG, WebP, GIF).');
                coverFileInput.value = '';
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Image is too large. Please choose an image smaller than 10MB.');
                coverFileInput.value = '';
                return;
            }

            // Sanitize filename
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storagePath = `blog-covers/${Date.now()}_${cleanName}`;
            const fileRef = storageRef(storage, storagePath);

            // Show progress UI
            if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';
            if (uploadProgressText) uploadProgressText.textContent = `Uploading "${file.name}" to Firebase Storage...`;
            if (uploadProgressBar) uploadProgressBar.style.width = '0%';
            if (uploadProgressPct) uploadProgressPct.textContent = '0%';
            if (uploadBtnLabel) {
                uploadBtnLabel.style.opacity = '0.6';
                uploadBtnLabel.style.pointerEvents = 'none';
            }

            try {
                const uploadTask = uploadBytesResumable(fileRef, file, {
                    contentType: file.type,
                    customMetadata: {
                        uploadedBy: currentUser ? currentUser.email : 'admin',
                        source: 'ndtechhub-blog-editor'
                    }
                });

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const rounded = Math.round(progress);
                        if (uploadProgressBar) uploadProgressBar.style.width = `${rounded}%`;
                        if (uploadProgressPct) uploadProgressPct.textContent = `${rounded}%`;
                    },
                    (error) => {
                        console.error('Firebase Storage Upload Error:', error);
                        alert(`Upload failed: ${error.message || error}`);
                        if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
                        if (uploadBtnLabel) {
                            uploadBtnLabel.style.opacity = '1';
                            uploadBtnLabel.style.pointerEvents = 'auto';
                        }
                    },
                    async () => {
                        // Upload complete
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        if (coverInput) coverInput.value = downloadUrl;
                        updateCoverPreview(downloadUrl);
                        if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
                        if (uploadBtnLabel) {
                            uploadBtnLabel.style.opacity = '1';
                            uploadBtnLabel.style.pointerEvents = 'auto';
                        }
                    }
                );
            } catch (err) {
                console.error("Storage Initialization Error:", err);
                alert(`Storage error: ${err.message || err}`);
                if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
                if (uploadBtnLabel) {
                    uploadBtnLabel.style.opacity = '1';
                    uploadBtnLabel.style.pointerEvents = 'auto';
                }
            }
        });
    }

    // Cover preview listeners
    if (coverInput) {
        coverInput.addEventListener('input', () => {
            const url = coverInput.value.trim();
            if (url) updateCoverPreview(url);
            else hideCoverPreview();
        });
    }

    if (removeCoverBtn) {
        removeCoverBtn.addEventListener('click', () => {
            if (coverInput) coverInput.value = '';
            if (coverFileInput) coverFileInput.value = '';
            hideCoverPreview();
        });
    }

    function updateCoverPreview(url) {
        if (coverPreviewContainer && coverPreviewImg) {
            coverPreviewImg.src = url;
            coverPreviewContainer.style.display = 'block';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function hideCoverPreview() {
        if (coverPreviewContainer && coverPreviewImg) {
            coverPreviewImg.src = '';
            coverPreviewContainer.style.display = 'none';
        }
    }

    // ── 5. Edit Existing Post Detection ────────────────────────────────────────
    async function checkEditMode() {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');
        if (!postId) return;

        try {
            const postSnap = await get(child(dbRef(database), `posts/${postId}`));
            if (postSnap.exists()) {
                const post = postSnap.val();
                editingPostId = postId;
                originalCreatedAt = post.createdAt || Date.now();

                if (editorHeading) editorHeading.textContent = 'Edit Article';
                if (publishBtn) publishBtn.textContent = 'Update Article';
                if (titleInput) titleInput.value = post.title || '';
                if (coverInput) {
                    coverInput.value = post.coverImage || '';
                    if (post.coverImage) updateCoverPreview(post.coverImage);
                }
                if (tagsInput) {
                    tagsInput.value = Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');
                }
                if (quill && post.content) {
                    quill.root.innerHTML = post.content;
                }
            } else {
                console.warn(`Post with ID ${postId} not found in database.`);
            }
        } catch (err) {
            console.error('Error fetching post for editing:', err);
        }
    }

    // ── 6. Publish / Update Post to Firebase ───────────────────────────────────
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            if (!currentUser) {
                alert('Please sign in as an authorized admin first.');
                return;
            }

            const title = titleInput ? titleInput.value.trim() : '';
            if (!title) {
                alert('Please provide a post title.');
                if (titleInput) titleInput.focus();
                return;
            }

            const contentHtml = quill ? quill.root.innerHTML.trim() : '';
            const plainText = quill ? quill.getText().trim() : '';
            if (!plainText || plainText.length < 10) {
                alert('Please write article content (at least 10 characters).');
                return;
            }

            const coverImage = coverInput ? coverInput.value.trim() : '';
            const rawTags = tagsInput ? tagsInput.value.trim() : '';
            const tags = rawTags
                ? rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                : ['engineering'];

            // Generate clean URL slug
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;

            // Calculate reading time
            const wordCount = plainText.split(/\s+/).length;
            const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

            publishBtn.disabled = true;
            publishBtn.textContent = editingPostId ? 'Updating Article...' : 'Publishing Article...';

            try {
                const postId = editingPostId || push(child(dbRef(database), 'posts')).key;
                const postPayload = {
                    id: postId,
                    slug: slug,
                    title: title,
                    coverImage: coverImage,
                    tags: tags,
                    content: contentHtml,
                    snippet: plainText.slice(0, 180).trim() + (plainText.length > 180 ? '...' : ''),
                    readTime: `${readingTimeMinutes} min read`,
                    author: {
                        name: currentUser.displayName || 'NDTechHub Editorial Team',
                        email: currentUser.email,
                        photoURL: currentUser.photoURL || 'assets/logos/ndtechhub.webp'
                    },
                    createdAt: originalCreatedAt || Date.now(),
                    updatedAt: Date.now(),
                    published: true
                };

                await set(dbRef(database, `posts/${postId}`), postPayload);

                publishBtn.textContent = 'Published Successfully! Redirecting...';
                setTimeout(() => {
                    window.location.href = `blog-post.html?slug=${slug}`;
                }, 1000);
            } catch (err) {
                console.error('Firebase Database Save Error:', err);
                alert(`Failed to save post: ${err.message || err}`);
                publishBtn.disabled = false;
                publishBtn.textContent = editingPostId ? 'Update Article' : 'Publish Post';
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Discard changes and return to the blog index?')) {
                window.location.href = 'blog.html';
            }
        });
    }
});

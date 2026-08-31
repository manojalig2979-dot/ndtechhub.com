// blog-editor.js — Write / Edit Blog Post (Auth-gated)
import { db, auth, isAdmin, watchAuthState, openAuthModal, storage }
  from "./firebase-auth.js";
import {
  collection, doc, addDoc, getDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let currentUser = null;
let quill       = null;
const editId    = new URLSearchParams(location.search).get('edit');
const isEdit    = !!editId;

// ── Guard: redirect if not logged in ─────────────────────────────────────────
function guardAuth(user) {
  const gate = document.getElementById('editor-auth-gate');
  const form = document.getElementById('editor-form-area');
  if (!user) {
    if (gate) gate.style.display = 'flex';
    if (form) form.style.display = 'none';
  } else {
    if (gate) gate.style.display = 'none';
    if (form) form.style.display = 'block';
    initEditor();
  }
}

// ── Premium Toast Notification helper ────────────────────────────────────────
function showToast(message, type = 'info') {
  let toast = document.getElementById('blog-editor-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'blog-editor-toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 10000;
      padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px;
      background: rgba(8, 12, 20, 0.9); border: 1px solid rgba(0, 242, 254, 0.3);
      color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
      transition: opacity 0.3s, transform 0.3s; transform: translateY(20px); opacity: 0;
      display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(toast);
  }
  
  let iconHtml = '';
  if (type === 'loading') {
    iconHtml = `<div style="width:14px;height:14px;border-radius:50%;border:2px solid rgba(0,242,254,.3);border-top-color:#00f2fe;animation:spin 1s linear infinite;"></div>`;
    toast.style.borderColor = 'rgba(0, 242, 254, 0.4)';
    toast.style.color = '#00f2fe';
  } else if (type === 'error') {
    iconHtml = `<span style="color:#ef4444;font-size:16px;">⚠️</span>`;
    toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    toast.style.color = '#f87171';
  } else {
    iconHtml = `<span style="color:#10b981;font-size:16px;">✓</span>`;
    toast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    toast.style.color = '#34d399';
  }
  
  toast.innerHTML = `${iconHtml} <span>${message}</span>`;
  
  if (!document.getElementById('toast-spin-style')) {
    const style = document.createElement('style');
    style.id = 'toast-spin-style';
    style.innerHTML = `@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }

  toast.offsetHeight;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  if (type !== 'loading') {
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId));
    }
    const timeoutId = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 4000);
    toast.dataset.timeoutId = timeoutId.toString();
  }
}

// ── Upload helper ───────────────────────────────────────────────────────────
function uploadImageToFirebaseStorage(file, pathPrefix, onProgress, onSuccess, onError) {
  if (!currentUser) {
    onError(new Error('User not logged in.'));
    return;
  }
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileRef = ref(storage, `${pathPrefix}/${currentUser.uid}/${Date.now()}_${cleanFileName}`);
  const uploadTask = uploadBytesResumable(fileRef, file);

  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      onProgress(progress);
    },
    (error) => {
      console.error("Storage upload error:", error);
      onError(error);
    },
    async () => {
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onSuccess(downloadURL);
      } catch (err) {
        onError(err);
      }
    }
  );
}

// ── Cover Image Upload ───────────────────────────────────────────────────────
function handleCoverImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }

  showToast('Starting cover image upload...', 'loading');

  uploadImageToFirebaseStorage(
    file,
    'blog_covers',
    (progress) => {
      showToast(`Uploading cover image (${progress}%)...`, 'loading');
    },
    (downloadURL) => {
      document.getElementById('post-cover').value = downloadURL;
      showToast('Cover image uploaded successfully!', 'success');
    },
    (error) => {
      showToast(`Failed to upload cover image: ${error.message}`, 'error');
    }
  );
}

// ── Init Quill Editor ─────────────────────────────────────────────────────────
function initEditor() {
  if (quill) return; // Don't init twice
  quill = new Quill('#quill-editor', {
    theme: 'snow',
    placeholder: 'Write your post content here...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    }
  });

  // Custom Image Handler for Quill
  quill.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'error');
        return;
      }

      showToast('Starting image upload...', 'loading');

      uploadImageToFirebaseStorage(
        file,
        'blog_images',
        (progress) => {
          showToast(`Uploading inline image (${progress}%)...`, 'loading');
        },
        (downloadURL) => {
          const range = quill.getSelection(true);
          if (range) {
            quill.insertEmbed(range.index, 'image', downloadURL);
            quill.setSelection(range.index + 1);
            showToast('Inline image uploaded and inserted!', 'success');
          } else {
            showToast('Failed to insert: editor cursor not found.', 'error');
          }
        },
        (error) => {
          showToast(`Failed to upload image: ${error.message}`, 'error');
        }
      );
    };
  });

  // If editing, load existing post
  if (isEdit) loadPostForEdit();
}

// ── Load Existing Post ────────────────────────────────────────────────────────
async function loadPostForEdit() {
  const snap = await getDoc(doc(db, 'blog_posts', editId));
  if (!snap.exists()) { alert('Post not found.'); window.location.href = 'blog'; return; }
  const post = snap.data();

  // Check permission
  if (currentUser.uid !== post.authorId && !isAdmin(currentUser)) {
    alert('You do not have permission to edit this post.');
    window.location.href = 'blog';
    return;
  }

  document.getElementById('post-title').value     = post.title || '';
  document.getElementById('post-cover').value     = post.coverImage || '';
  document.getElementById('post-tags').value      = (post.tags||[]).join(', ');
  document.getElementById('editor-heading').textContent = 'Edit Post';
  document.getElementById('publish-btn').textContent    = 'Update Post';
  quill.root.innerHTML = post.content || '';
}

// ── Estimate read time ───────────────────────────────────────────────────────
function estimateReadTime(html) {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Publish / Update ─────────────────────────────────────────────────────────
async function publishPost() {
  const title  = document.getElementById('post-title').value.trim();
  const cover  = document.getElementById('post-cover').value.trim();
  const rawTags = document.getElementById('post-tags').value;
  const tags   = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const content = quill.root.innerHTML;
  const textContent = quill.getText().trim();

  if (!title)        { alert('Please enter a title.'); return; }
  if (!textContent)  { alert('Please write some content.'); return; }

  // Build excerpt (first 160 chars of plain text)
  const excerpt = textContent.substring(0, 160).trim() + (textContent.length > 160 ? '…' : '');
  const readTime = estimateReadTime(content);

  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.textContent = isEdit ? 'Updating...' : 'Publishing...';

  try {
    if (isEdit) {
      await updateDoc(doc(db, 'blog_posts', editId), {
        title, coverImage: cover, tags, content, excerpt, readTime,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'blog_posts'), {
        title, coverImage: cover, tags, content, excerpt, readTime,
        authorId:    currentUser.uid,
        authorName:  currentUser.displayName || currentUser.email,
        authorEmail: currentUser.email,
        authorPhoto: currentUser.photoURL || '',
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp()
      });
    }
    window.location.href = 'blog';
  } catch (err) {
    alert('Failed to save post: ' + err.message);
    btn.disabled = false;
    btn.textContent = isEdit ? 'Update Post' : 'Publish Post';
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  watchAuthState(user => {
    currentUser = user;
    guardAuth(user);
    // Update auth header
    const area = document.getElementById('auth-header-area');
    if (area && user) {
      area.innerHTML = `<span style="font-size:13px;color:rgba(255,255,255,.6);font-weight:600;">${user.displayName||user.email}</span>`;
    }
  });

  document.getElementById('publish-btn')?.addEventListener('click', publishPost);
  document.getElementById('open-signin-btn')?.addEventListener('click', openAuthModal);
  document.getElementById('cancel-btn')?.addEventListener('click', () => { window.location.href = 'blog'; });
  document.getElementById('cover-file-input')?.addEventListener('change', handleCoverImageUpload);

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

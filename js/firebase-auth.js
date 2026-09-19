// js/firebase-auth.js
import { app } from "./firebase-init.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Initialize Firebase Auth
export const auth = getAuth(app);

// Authorized Administrator Emails
export const ADMIN_EMAILS = [
    'manoj.alig2979@gmail.com',
    'connect@ndtechhub.com'
];

/**
 * Validates if a given Firebase User is an authorized administrator
 * @param {Object} user - Firebase Auth User Object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

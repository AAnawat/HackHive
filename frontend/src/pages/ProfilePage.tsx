import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { updateUser, createUserUpdateFormData } from '../api/client';
import type { User } from '../types';
import ScoreSection from '../components/ScoreSection';


// Type definitions for enhanced profile page
type ViewMode = 'normal' | 'editing';

interface EditFormData {
  username: string;
  gmail: string;
  currentPassword: string;
  newPassword: string;
  selectedFile: File | null;
}

interface UIState {
  loading: boolean;
  error: string | null;
  message: string | null;
}

export default function ProfilePage() {
  const { user: authUser, token, reloadUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [mode, setMode] = useState<ViewMode>('normal');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const [editForm, setEditForm] = useState<EditFormData>({
    username: '',
    gmail: '',
    currentPassword: '',
    newPassword: '',
    selectedFile: null
  });

  const [uiState, setUIState] = useState<UIState>({
    loading: false,
    error: null,
    message: null
  });

  // Mode transition functions with proper cleanup
  const enterEditMode = () => {
    if (user) {
      // Initialize edit form with current user data as per requirement 2.1
      setEditForm({
        username: user.username || '',
        gmail: user.gmail || '',
        currentPassword: '', // Always start with empty current password
        newPassword: '', // Always start with empty new password
        selectedFile: null
      });
    }

    // Clear any existing UI messages and loading states when entering edit mode
    setUIState({
      loading: false,
      error: null,
      message: null
    });
    setLoadingMessage('');

    // Transition to editing mode
    setMode('editing');
  };

  const exitEditMode = () => {
    // Proper cleanup when switching modes - reset all edit-related state
    setEditForm({
      username: '',
      gmail: '',
      currentPassword: '',
      newPassword: '',
      selectedFile: null
    });

    // Clear any existing UI messages and loading states when exiting edit mode
    setUIState({
      loading: false,
      error: null,
      message: null
    });
    setLoadingMessage('');

    // Transition to normal mode
    setMode('normal');
  };

  useEffect(() => {
    if (!authUser) return;

    // Update local user state when authUser changes (including after reloadUser)
    setUser(authUser);

    // Initialize edit form with user data if in editing mode
    if (mode === 'editing') {
      setEditForm(prev => ({
        ...prev,
        username: authUser.username || '',
        gmail: authUser.gmail || '',
        // Keep existing password fields and selectedFile values
        currentPassword: prev.currentPassword,
        newPassword: prev.newPassword,
        selectedFile: prev.selectedFile
      }));
    }
  }, [authUser, mode]);

  // Cleanup effect for mode transitions - ensures proper cleanup when switching modes
  useEffect(() => {
    return () => {
      // Cleanup any object URLs created for file previews to prevent memory leaks
      if (editForm.selectedFile) {
        URL.revokeObjectURL(URL.createObjectURL(editForm.selectedFile));
      }
    };
  }, [mode, editForm.selectedFile]);



  if (!authUser) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] grid place-items-center text-neutral-300">
          Please login to view your profile.
        </div>
      </AppLayout>
    );
  }

  // Render Normal View - read-only display as per requirement 1.2, 1.3
  const renderNormalView = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Score Section */}
      <ScoreSection user={user} loading={!user && !!authUser} />

      {/* Profile Card - Normal View with mode-specific styling */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur px-5 sm:px-6 py-6 sm:py-8 shadow-lg relative">
        {/* Mode indicator for normal view */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>View Mode</span>
        </div>

        {/* Circular Profile Picture at Top Center */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={user?.pfp_path || '/Hive.png'}
              alt="Profile"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-neutral-800 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-black text-xs font-semibold border border-neutral-900">
              ID
            </span>
          </div>
        </div>

        {/* Username and Email on Separate Lines - Requirements 5.1, 5.2, 5.3, 5.4, 5.5 */}
        <div className="text-center mb-6 space-y-3">
          <div className="text-xl sm:text-2xl font-semibold text-neutral-100 leading-tight">
            {user?.username || 'Unnamed'}
          </div>
          <div className="text-base text-neutral-300 font-medium">
            {user?.gmail || 'No email set'}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-800 my-6" />

        {/* Success/Error Messages */}
        {uiState.error && (
          <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/50 text-red-300 px-4 py-2 text-sm">
            {uiState.error}
          </div>
        )}
        {uiState.message && (
          <div className="mb-4 rounded-lg border border-green-900/60 bg-green-950/50 text-green-300 px-4 py-2 text-sm">
            {uiState.message}
          </div>
        )}

        {/* Profile Information - Read-only display with normal mode styling */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5 text-neutral-400 font-medium">Username</label>
              <div className="w-full px-3 py-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/50 text-neutral-200 transition-colors hover:bg-neutral-950/70 font-medium">
                {user?.username || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5 text-neutral-400 font-medium">Email</label>
              <div className="w-full px-3 py-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/50 text-neutral-200 transition-colors hover:bg-neutral-950/70 font-medium">
                {user?.gmail || 'Not set'}
              </div>
            </div>
          </div>
        </section>

        {/* Edit Profile Button - shown only in normal mode with enhanced styling */}
        <div className="flex items-center gap-3 pt-6 border-t border-neutral-800">
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={enterEditMode}
              className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-medium hover:brightness-95 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <div className="text-xs text-neutral-500">
              Click to modify your profile information
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.trim().length < 2) {
      return 'Username must be at least 2 characters long';
    }
    if (username.trim().length > 50) {
      return 'Username must be less than 50 characters';
    }
    return null;
  };

  const validateEmailField = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const validatePasswords = (): { currentPassword?: string; newPassword?: string } => {
    const errors: { currentPassword?: string; newPassword?: string } = {};

    const hasCurrentPassword = editForm.currentPassword.trim().length > 0;
    const hasNewPassword = editForm.newPassword.trim().length > 0;

    // If either password field has content, both are required
    if (hasCurrentPassword || hasNewPassword) {
      if (!hasCurrentPassword) {
        errors.currentPassword = 'Current password is required when changing password';
      }
      if (!hasNewPassword) {
        errors.newPassword = 'New password is required when changing password';
      }

      // Validate new password strength if provided
      if (hasNewPassword && editForm.newPassword.length < 8) {
        errors.newPassword = 'New password must be at least 8 characters long';
      }
    }

    return errors;
  };

  const getFieldErrors = () => {
    const errors: Record<string, string> = {};

    const usernameError = validateUsername(editForm.username);
    if (usernameError) errors.username = usernameError;

    const emailError = validateEmailField(editForm.gmail);
    if (emailError) errors.gmail = emailError;

    const passwordErrors = validatePasswords();
    if (passwordErrors.currentPassword) errors.currentPassword = passwordErrors.currentPassword;
    if (passwordErrors.newPassword) errors.newPassword = passwordErrors.newPassword;

    return errors;
  };

  // Handle form input changes with proper state binding
  const handleFormChange = (field: keyof EditFormData, value: string | File | null) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific errors when user starts typing
    if (uiState.error && typeof value === 'string' && value.trim()) {
      setUIState(prev => ({
        ...prev,
        error: null
      }));
    }
  };

  // Handle save operation with proper loading states as per requirement 3.1
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      setUIState(prev => ({
        ...prev,
        error: 'Not authenticated'
      }));
      return;
    }

    // Validate form before submission
    const fieldErrors = getFieldErrors();
    if (Object.keys(fieldErrors).length > 0) {
      const errorCount = Object.keys(fieldErrors).length;
      const errorMessage = errorCount === 1
        ? 'Please fix the validation error above'
        : `Please fix the ${errorCount} validation errors above`;

      setUIState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return;
    }

    // Set loading state with appropriate message
    setUIState(prev => ({
      ...prev,
      loading: true,
      error: null,
      message: null
    }));

    try {
      const payload: Record<string, unknown> = {};

      // Use editForm state for form data - only include changed fields
      if (editForm.username.trim() && editForm.username.trim() !== user.username) {
        payload.username = editForm.username.trim();
      }
      if (editForm.gmail.trim() && editForm.gmail.trim() !== user.gmail) {
        payload.gmail = editForm.gmail.trim();
      }
      if (editForm.currentPassword.trim() && editForm.newPassword.trim()) {
        payload.oldPass = editForm.currentPassword;
        payload.newPass = editForm.newPassword;
      }

      const hasTextChanges = Object.keys(payload).length > 0;
      const hasFileChange = editForm.selectedFile !== null;

      // Additional file validation before upload
      if (hasFileChange && editForm.selectedFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(editForm.selectedFile.type)) {
          setUIState(prev => ({
            ...prev,
            loading: false,
            error: 'Please select a valid image file (JPG, PNG, GIF, or WebP)'
          }));
          return;
        }
      }

      // Set specific loading message based on update type
      const isPasswordChange = payload.oldPass && payload.newPass;

      if (hasFileChange && hasTextChanges) {
        if (isPasswordChange) {
          setLoadingMessage('Updating profile, changing password, and uploading picture...');
        } else {
          setLoadingMessage('Updating profile and uploading picture...');
        }
      } else if (hasFileChange) {
        setLoadingMessage('Uploading picture...');
      } else if (isPasswordChange) {
        setLoadingMessage('Changing password...');
      } else {
        setLoadingMessage('Updating profile...');
      }

      if (!hasTextChanges && !hasFileChange) {
        setUIState(prev => ({
          ...prev,
          loading: false,
          message: 'No changes to save'
        }));
        return;
      }

      // Always use FormData as backend only accepts FormData for user updates
      let updatePayload: FormData;

      if (hasFileChange && editForm.selectedFile) {
        // Use FormData with both text fields and file
        updatePayload = createUserUpdateFormData(payload, editForm.selectedFile);
      } else if (hasTextChanges) {
        // Use FormData for text-only updates (no file)
        updatePayload = createUserUpdateFormData(payload);
      } else {
        // This shouldn't happen due to earlier check, but handle gracefully
        setUIState(prev => ({
          ...prev,
          loading: false,
          message: 'No changes to save'
        }));
        return;
      }

      // Call the updateUser API function with appropriate payload
      await updateUser(user.id, updatePayload, token);

      // Set specific success message based on update type
      let successMessage = '';
      const updatedFields = [];

      if (payload.username) updatedFields.push('username');
      if (payload.gmail) updatedFields.push('email');
      if (payload.oldPass && payload.newPass) updatedFields.push('password');
      if (hasFileChange && editForm.selectedFile) updatedFields.push('profile picture');

      if (updatedFields.length === 1) {
        if (updatedFields[0] === 'password') {
          successMessage = 'Password changed successfully';
        } else {
          successMessage = `${updatedFields[0].charAt(0).toUpperCase() + updatedFields[0].slice(1)} updated successfully`;
        }
      } else if (updatedFields.length === 2) {
        if (updatedFields.includes('password')) {
          const otherField = updatedFields.find(field => field !== 'password');
          successMessage = `${otherField?.charAt(0).toUpperCase() + otherField?.slice(1)} and password updated successfully`;
        } else {
          successMessage = `${updatedFields[0].charAt(0).toUpperCase() + updatedFields[0].slice(1)} and ${updatedFields[1]} updated successfully`;
        }
      } else {
        successMessage = 'Profile updated successfully';
      }

      setUIState(prev => ({
        ...prev,
        loading: false,
        message: successMessage
      }));

      // Clear loading message
      setLoadingMessage('');

      // Return to normal mode after successful save as per requirement 3.3
      setTimeout(async () => {
        setMode('normal');
        // Clear success message when transitioning back to normal mode
        setUIState(prev => ({
          ...prev,
          message: null
        }));

        // Refresh user data to reflect changes using reloadUser from AuthContext
        try {
          await reloadUser();
        } catch (error) {
          // Silently handle refresh errors - user data will be stale but functional
          console.error('Failed to reload user after update:', error);
        }
      }, 2000); // Show success message briefly before transitioning

    } catch (e: any) {
      // Provide specific error messages based on error content and context
      let errorMessage = e.message || 'Update failed';

      // Handle specific error scenarios
      if (e.message?.includes('Unsupported file type')) {
        errorMessage = 'Please select a valid image file (JPG, PNG, GIF, or WebP)';
      } else if (e.message?.includes('Network error') || e.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again';
      } else if (e.message?.includes('Unauthorized') || e.message?.includes('401')) {
        errorMessage = 'Session expired. Please log in again';
      } else if (e.message?.includes('username') && e.message?.includes('taken')) {
        errorMessage = 'Username is already taken. Please choose a different one';
      } else if (e.message?.includes('email') && e.message?.includes('taken')) {
        errorMessage = 'Email is already registered. Please use a different email';
      } else if (e.message?.includes('current password') || e.message?.includes('Current password') || e.message?.includes('incorrect password') || e.message?.includes('wrong password')) {
        errorMessage = 'Current password is incorrect. Please enter your correct current password';
      } else if (e.message?.includes('password') && (e.message?.includes('invalid') || e.message?.includes('weak'))) {
        errorMessage = 'New password does not meet security requirements. Please choose a stronger password';
      } else if (editForm.selectedFile) {
        errorMessage = `File upload failed: ${e.message || 'Please try again with a different image'}`;
      } else {
        errorMessage = `Profile update failed: ${e.message || 'Please check your information and try again'}`;
      }

      setUIState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      setLoadingMessage('');
    }
  };

  // Render Edit View - form inputs for editing as per requirements 2.2, 4.4, 5.2
  const renderEditView = () => {
    const fieldErrors = getFieldErrors();
    const hasValidationErrors = Object.keys(fieldErrors).length > 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Score Section */}
        <ScoreSection user={user} loading={!user && !!authUser} />

        {/* Profile Card - Edit Mode with enhanced styling */}
        <div className="rounded-2xl border border-yellow-500/30 bg-neutral-900/60 backdrop-blur px-5 sm:px-6 py-6 sm:py-8 shadow-lg shadow-yellow-500/5 relative">
          {/* Mode indicator for edit view */}
          <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-yellow-400">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span>Edit Mode</span>
          </div>

          {/* Circular Profile Picture at Top Center - Clickable for File Selection */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-picture-input')?.click()}>
              <img
                src={editForm.selectedFile ? URL.createObjectURL(editForm.selectedFile) : (user?.pfp_path || '/Hive.png')}
                alt="Profile"
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-yellow-500/50 object-cover transition-all duration-200 group-hover:border-yellow-500"
              />
              <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-black text-xs font-semibold border border-neutral-900">
                ID
              </span>
              {/* Edit indicator overlay */}
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-400 text-center">
              Click to change profile picture
            </div>
          </div>

          {/* Username and Email on Separate Lines - Requirements 5.1, 5.2, 5.3, 5.4, 5.5 */}
          <div className="text-center mb-6 space-y-3">
            <div className="text-xl sm:text-2xl font-semibold text-neutral-100 leading-tight">
              {editForm.username || 'Unnamed'}
            </div>
            <div className="text-base text-neutral-300 font-medium">
              {editForm.gmail || 'No email set'}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-800 my-6" />

          {/* Success/Error Messages */}
          {uiState.error && (
            <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/50 text-red-300 px-4 py-2 text-sm">
              {uiState.error}
            </div>
          )}
          {uiState.message && (
            <div className="mb-4 rounded-lg border border-green-900/60 bg-green-950/50 text-green-300 px-4 py-2 text-sm">
              {uiState.message}
            </div>
          )}

          {/* Hidden file input for profile picture */}
          <input
            id="profile-picture-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                  setUIState(prev => ({
                    ...prev,
                    error: 'Please select a valid image file (JPG, PNG, GIF, or WebP)'
                  }));
                  return;
                }

                // Clear any existing errors and set the file
                setUIState(prev => ({
                  ...prev,
                  error: null
                }));
                handleFormChange('selectedFile', file);
              }
            }}
            className="hidden"
          />

          {/* Form with controlled inputs and validation */}
          <form onSubmit={handleSave} className="space-y-5">
            <section className="bg-neutral-950/30 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Profile Information
                <span className="text-xs text-neutral-400 font-normal">(editable)</span>
              </h3>
              <div className="space-y-4">
                {/* Username Input - controlled component with validation on separate line */}
                <div>
                  <label className="block text-xs mb-1.5 text-yellow-300 font-medium">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 transition ${fieldErrors.username
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-neutral-800 focus:ring-yellow-500 focus:border-yellow-500'
                      }`}
                    placeholder="Enter your username"
                    required
                  />
                  {fieldErrors.username && (
                    <div className="mt-1 text-xs text-red-400">{fieldErrors.username}</div>
                  )}
                </div>

                {/* Email Input - controlled component with validation on separate line */}
                <div>
                  <label className="block text-xs mb-1.5 text-yellow-300 font-medium">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.gmail}
                    onChange={(e) => handleFormChange('gmail', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 transition ${fieldErrors.gmail
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-neutral-800 focus:ring-yellow-500 focus:border-yellow-500'
                      }`}
                    placeholder="Enter your email address"
                    required
                  />
                  {fieldErrors.gmail && (
                    <div className="mt-1 text-xs text-red-400">{fieldErrors.gmail}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-neutral-950/30 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
                <span className="text-xs text-neutral-400 font-normal">(optional)</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Current Password Input - controlled component */}
                <div>
                  <label className="block text-xs mb-1.5 text-yellow-300 font-medium">Current Password</label>
                  <input
                    type="password"
                    value={editForm.currentPassword}
                    onChange={(e) => handleFormChange('currentPassword', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 transition ${fieldErrors.currentPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-neutral-800 focus:ring-yellow-500 focus:border-yellow-500'
                      }`}
                    placeholder="Enter your current password"
                  />
                  {fieldErrors.currentPassword ? (
                    <div className="mt-1 text-xs text-red-400">{fieldErrors.currentPassword}</div>
                  ) : (
                    <div className="mt-1 text-xs text-neutral-500">
                      Required when changing password
                    </div>
                  )}
                </div>

                {/* New Password Input - controlled component */}
                <div>
                  <label className="block text-xs mb-1.5 text-yellow-300 font-medium">New Password</label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => handleFormChange('newPassword', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 transition ${fieldErrors.newPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-neutral-800 focus:ring-yellow-500 focus:border-yellow-500'
                      }`}
                    placeholder="Enter your new password"
                  />
                  {fieldErrors.newPassword ? (
                    <div className="mt-1 text-xs text-red-400">{fieldErrors.newPassword}</div>
                  ) : (
                    <div className="mt-1 text-xs text-neutral-500">
                      Must be at least 8 characters long
                    </div>
                  )}
                </div>
              </div>

              {/* Password change instructions */}
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-yellow-300">
                    <div className="font-medium mb-1">Password Change Requirements:</div>
                    <ul className="space-y-1 text-neutral-400">
                      <li>• Both current and new password fields are required</li>
                      <li>• Leave both fields blank to keep your current password</li>
                      <li>• New password must be at least 8 characters long</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Save and Cancel buttons - enhanced styling for edit mode */}
            <div className="flex items-center gap-3 pt-6 border-t border-yellow-500/30">
              <div className="flex items-center gap-3 pt-4">
                {/* Save Changes Button - with enhanced styling */}
                <button
                  type="submit"
                  disabled={uiState.loading || hasValidationErrors}
                  className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-medium hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20 ring-2 ring-yellow-500/20"
                >
                  {uiState.loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>{loadingMessage || 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                {/* Cancel Button - with enhanced styling */}
                <button
                  type="button"
                  onClick={exitEditMode}
                  disabled={uiState.loading}
                  className="px-6 py-2.5 rounded-lg bg-neutral-700 text-neutral-200 font-medium hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 border border-neutral-600 hover:border-neutral-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </div>

              {/* Validation Error Summary with enhanced styling */}
              {hasValidationErrors && (
                <div className="ml-auto text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-md px-3 py-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Please fix the errors above to save changes
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      {/* Conditional rendering with smooth transitions based on mode as per requirement 1.1, 5.1 */}
      <div className="transition-all duration-300 ease-in-out">
        {mode === 'normal' ? renderNormalView() : renderEditView()}
      </div>
    </AppLayout>
  );
}

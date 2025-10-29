# Testing Guide - Asset Management Features

## 🧪 Complete Testing Checklist

### Pre-Testing Setup
- [ ] Browser: Chrome/Firefox/Safari latest version
- [ ] Clear browser cache
- [ ] Open Developer Console (F12)
- [ ] Network tab open to monitor requests
- [ ] Console tab open to catch errors

---

## 1️⃣ View Asset Details Testing

### Test 1.1: Open Detail Modal
**Steps:**
1. Navigate to Assets page
2. Locate any asset in the table
3. Click the (⋮) dropdown menu
4. Click "View Details"

**Expected:**
- ✅ Modal opens immediately
- ✅ Asset name displayed in header
- ✅ Status badge shows correct color
- ✅ Asset ID displayed
- ✅ 3 tabs visible: Details, Blockchain, Maintenance
- ✅ Details tab is active by default

**Pass/Fail:** ___________

---

### Test 1.2: Details Tab Content
**Steps:**
1. Open asset detail modal
2. View Details tab

**Expected:**
- ✅ Image displayed (if asset has image)
- ✅ Basic Information section visible
- ✅ Category, Serial Number, Manufacturer, Model shown
- ✅ Financial Information section visible
- ✅ Purchase Value, Date, Warranty shown
- ✅ Location & Assignment section visible
- ✅ Location and Assigned To shown
- ✅ All data matches asset in table

**Pass/Fail:** ___________

---

### Test 1.3: Blockchain Tab
**Steps:**
1. Open asset detail modal
2. Click "Blockchain" tab
3. Check for blockchain data

**Expected if asset has blockchain data:**
- ✅ SPL Token Mint Address displayed
- ✅ Link to Solana Explorer present
- ✅ IPFS Metadata Hash displayed
- ✅ Link to IPFS Gateway present
- ✅ Blockchain properties table shown

**Expected if no blockchain data:**
- ✅ "Not on Blockchain" message
- ✅ "Mint on Blockchain" button visible

**Pass/Fail:** ___________

---

### Test 1.4: Maintenance Tab
**Steps:**
1. Open asset detail modal
2. Click "Maintenance" tab

**Expected:**
- ✅ "Maintenance Logs" header with count badge
- ✅ "Add Log" button visible
- ✅ Existing logs displayed (if any)
- ✅ Log cards show type, date, description
- ✅ Log badges colored correctly

**Pass/Fail:** ___________

---

### Test 1.5: Close Modal
**Steps:**
1. Open asset detail modal
2. Click X button (top-right)

**Expected:**
- ✅ Modal closes
- ✅ Assets table still visible
- ✅ No errors in console

**Alternative:**
- Click outside modal (background)
- Press Escape key
- Both should close modal

**Pass/Fail:** ___________

---

## 2️⃣ Edit Asset Testing

### Test 2.1: Enter Edit Mode
**Steps:**
1. Open asset detail modal
2. Click "Edit" button (top-right)

**Expected:**
- ✅ Edit mode activated
- ✅ Asset name becomes input field
- ✅ Status becomes dropdown
- ✅ All fields become editable
- ✅ Save button appears (green)
- ✅ Cancel button appears
- ✅ Edit button disappears
- ✅ Delete button remains visible

**Pass/Fail:** ___________

---

### Test 2.2: Edit Asset Name
**Steps:**
1. Enter edit mode
2. Change asset name
3. Click Save

**Expected:**
- ✅ Name updates in modal
- ✅ Toast notification appears
- ✅ Edit mode exits
- ✅ Name updates in table
- ✅ Modal stays open showing updated data

**Pass/Fail:** ___________

---

### Test 2.3: Edit Status
**Steps:**
1. Enter edit mode
2. Change status (e.g., Available → Maintenance)
3. Click Save

**Expected:**
- ✅ Status badge updates in modal
- ✅ Status badge updates in table
- ✅ Badge color changes correctly
- ✅ Toast notification appears

**Pass/Fail:** ___________

---

### Test 2.4: Edit Multiple Fields
**Steps:**
1. Enter edit mode
2. Change 3-5 different fields
3. Click Save

**Expected:**
- ✅ All changes saved
- ✅ All fields update in modal
- ✅ All fields update in table
- ✅ No data loss

**Test Fields:**
- Category
- Serial Number
- Manufacturer
- Location
- Assigned To

**Pass/Fail:** ___________

---

### Test 2.5: Cancel Edits
**Steps:**
1. Enter edit mode
2. Change several fields
3. Click Cancel

**Expected:**
- ✅ Edit mode exits
- ✅ All changes discarded
- ✅ Original data remains
- ✅ No save occurred
- ✅ No toast notification

**Pass/Fail:** ___________

---

### Test 2.6: Edit Financial Data
**Steps:**
1. Enter edit mode
2. Change Purchase Value
3. Change Purchase Date
4. Change Warranty Expiry
5. Click Save

**Expected:**
- ✅ Number validation works
- ✅ Date pickers work
- ✅ All financial data updates
- ✅ Dates format correctly

**Pass/Fail:** ___________

---

## 3️⃣ Maintenance Logging Testing

### Test 3.1: Open Add Log Form
**Steps:**
1. Open asset detail modal
2. Click Maintenance tab
3. Click "Add Log" button

**Expected:**
- ✅ Form appears below button
- ✅ Form has colored border (orange)
- ✅ All fields present:
  - Type (dropdown)
  - Date (date picker)
  - Description (textarea)
  - Performed By (input)
  - Cost (number input)
  - Notes (textarea)
- ✅ Save Log button visible
- ✅ Cancel button visible

**Pass/Fail:** ___________

---

### Test 3.2: Add Routine Maintenance
**Steps:**
1. Open Add Log form
2. Type: Routine
3. Date: Today
4. Description: "Regular check"
5. Performed By: "John Tech"
6. Cost: 50
7. Click "Save Log"

**Expected:**
- ✅ Form closes
- ✅ New log appears at top of list
- ✅ Log shows correct badge (Routine)
- ✅ Log shows date
- ✅ Log shows description
- ✅ Log shows technician
- ✅ Log shows cost
- ✅ Toast notification appears
- ✅ Badge count increases

**Pass/Fail:** ___________

---

### Test 3.3: Add Repair Log
**Steps:**
1. Add new log with Type: Repair
2. Fill all fields

**Expected:**
- ✅ Repair badge shows (red background)
- ✅ Log saves correctly

**Pass/Fail:** ___________

---

### Test 3.4: Required Field Validation
**Steps:**
1. Open Add Log form
2. Leave Description empty
3. Click "Save Log"

**Expected:**
- ✅ Toast error appears
- ✅ Message: "Description required"
- ✅ Form stays open
- ✅ No log created

**Pass/Fail:** ___________

---

### Test 3.5: Cancel Add Log
**Steps:**
1. Open Add Log form
2. Fill in some fields
3. Click "Cancel"

**Expected:**
- ✅ Form closes
- ✅ No log created
- ✅ Form data discarded

**Pass/Fail:** ___________

---

### Test 3.6: Multiple Logs
**Steps:**
1. Add 3 different logs
2. Verify all appear in history

**Expected:**
- ✅ All 3 logs visible
- ✅ Logs ordered by date (newest first)
- ✅ Each log has unique data
- ✅ Badge count shows 3 (or total)

**Pass/Fail:** ___________

---

## 4️⃣ Delete Asset Testing

### Test 4.1: Delete from Dropdown
**Steps:**
1. Assets page
2. Click (⋮) on an asset
3. Click "Delete"

**Expected:**
- ✅ Confirmation dialog appears
- ✅ Dialog shows asset name
- ✅ Dialog has Cancel button
- ✅ Dialog has Confirm button

**Pass/Fail:** ___________

---

### Test 4.2: Cancel Delete
**Steps:**
1. Start delete process
2. Click Cancel in dialog

**Expected:**
- ✅ Dialog closes
- ✅ Asset not deleted
- ✅ Asset still in table
- ✅ No toast notification

**Pass/Fail:** ___________

---

### Test 4.3: Confirm Delete
**Steps:**
1. Start delete process
2. Click Confirm in dialog

**Expected:**
- ✅ Asset removed from table immediately
- ✅ Toast notification appears
- ✅ Success message shows
- ✅ Total count decreases
- ✅ Stats update
- ✅ No errors in console

**Pass/Fail:** ___________

---

### Test 4.4: Delete from Modal
**Steps:**
1. Open asset detail modal
2. Click Delete button (trash icon)
3. Confirm

**Expected:**
- ✅ Same as Test 4.3
- ✅ Modal closes after delete
- ✅ Asset removed from table

**Pass/Fail:** ___________

---

### Test 4.5: Delete Multiple Assets
**Steps:**
1. Delete 3 different assets
2. Verify each deletion

**Expected:**
- ✅ Each delete works independently
- ✅ Stats update correctly each time
- ✅ No duplicate prompts
- ✅ All confirmations required

**Pass/Fail:** ___________

---

## 5️⃣ Quick Add Button Testing

### Test 5.1: Button Visibility
**Steps:**
1. Navigate to different pages
2. Check for Add Asset button

**Expected:**
- ✅ Button visible on Assets page
- ✅ Button visible on Dashboard
- ✅ Button visible on Governance page
- ✅ Button visible on all pages
- ✅ Button NOT visible on mobile (<768px)
- ✅ Button has orange background
- ✅ Button has Plus icon

**Pass/Fail:** ___________

---

### Test 5.2: Button Functionality
**Steps:**
1. From Assets page
2. Click "Add Asset" button in top bar

**Expected:**
- ✅ Navigates to Add Asset page
- ✅ Form is empty/ready
- ✅ Same as sidebar "Add Asset"

**Pass/Fail:** ___________

---

### Test 5.3: Cross-Page Navigation
**Steps:**
1. Go to Dashboard
2. Click top bar "Add Asset"
3. Add asset
4. Return to Dashboard

**Expected:**
- ✅ Navigation works from any page
- ✅ New asset created successfully
- ✅ Can return to original page

**Pass/Fail:** ___________

---

## 6️⃣ Integration Testing

### Test 6.1: Complete Workflow
**Steps:**
1. Add new asset via top bar button
2. View details
3. Edit asset
4. Add maintenance log
5. Delete asset

**Expected:**
- ✅ All steps work in sequence
- ✅ No errors between steps
- ✅ Data consistent throughout
- ✅ All notifications appear

**Pass/Fail:** ___________

---

### Test 6.2: Concurrent Actions
**Steps:**
1. Open 2 browser tabs
2. Edit same asset in both
3. Save in Tab 1
4. Try to save in Tab 2

**Expected:**
- ✅ Tab 1 saves successfully
- ✅ Tab 2 shows updated data OR
- ✅ Tab 2 shows conflict warning

**Pass/Fail:** ___________

---

### Test 6.3: Rapid Operations
**Steps:**
1. Quickly open/close modals (10x)
2. Quickly edit/save (5x)
3. Quickly add logs (3x)

**Expected:**
- ✅ No UI freezing
- ✅ No duplicate operations
- ✅ All data saves correctly
- ✅ No memory leaks (check dev tools)

**Pass/Fail:** ___________

---

## 7️⃣ Error Handling Testing

### Test 7.1: Invalid Data
**Steps:**
1. Edit asset
2. Enter invalid date
3. Enter negative value
4. Try to save

**Expected:**
- ✅ Validation prevents save OR
- ✅ Error message shows
- ✅ Invalid fields highlighted

**Pass/Fail:** ___________

---

### Test 7.2: Network Error Simulation
**Steps:**
1. Open Chrome DevTools
2. Set Network to "Offline"
3. Try to save edit

**Expected:**
- ✅ Error handling present OR
- ✅ Friendly error message
- ✅ No app crash

**Pass/Fail:** ___________

---

## 8️⃣ Browser Compatibility

### Test 8.1: Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations

### Test 8.2: Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations

### Test 8.3: Safari
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations

### Test 8.4: Edge
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations

---

## 9️⃣ Responsive Design Testing

### Test 9.1: Desktop (1920x1080)
- [ ] Modal displays correctly
- [ ] All buttons accessible
- [ ] Table fits screen
- [ ] No horizontal scroll

### Test 9.2: Laptop (1366x768)
- [ ] Modal not too large
- [ ] Content readable
- [ ] Buttons not overlapping

### Test 9.3: Tablet (768x1024)
- [ ] Modal adapts
- [ ] Touch targets adequate
- [ ] Content not cut off

### Test 9.4: Mobile (375x667)
- [ ] Top bar button hidden
- [ ] Modal scrollable
- [ ] Forms usable
- [ ] Dropdowns work

---

## 🎯 Critical Path Testing

**Priority 1 (Must Work):**
1. ✅ View asset details
2. ✅ Edit and save asset
3. ✅ Add maintenance log
4. ✅ Delete asset with confirmation

**Priority 2 (Should Work):**
1. ✅ Cancel edit without saving
2. ✅ Cancel delete
3. ✅ View blockchain tab
4. ✅ Quick add from top bar

**Priority 3 (Nice to Have):**
1. ✅ Multiple rapid operations
2. ✅ Cross-browser compatibility
3. ✅ Mobile responsiveness

---

## 📊 Test Summary

### Test Results
- Total Tests: ______
- Passed: ______
- Failed: ______
- Skipped: ______

### Pass Rate
- Target: 95%+
- Actual: ______%

### Critical Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

### Minor Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

### Recommendations
1. ___________________________
2. ___________________________
3. ___________________________

---

## ✅ Sign-Off

**Tested By:** ___________________  
**Date:** ___________________  
**Version:** 1.2.0  
**Status:** [ ] Approved [ ] Needs Work  

**Notes:**
_________________________________
_________________________________
_________________________________

---

**Last Updated**: October 28, 2025  
**Document Version**: 1.0

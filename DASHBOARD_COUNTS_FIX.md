# Dashboard Counts Update Fix

## Issue
Dashboard cards (Achievements, Shout-Outs Posted, Shout-Outs Received) were not updating after creating shout-outs.

## Root Causes Identified
1. Summary was not being refreshed immediately after shout-out creation
2. Potential timing issues with database commits
3. No automatic refresh when switching to dashboard tab

## Fixes Applied

### 1. Immediate Summary Refresh After Actions
**File**: `frontend/src/pages/Home.jsx`

- Modified `handleShoutOutCreated()` to call `fetchSummary()` immediately after shout-out creation
- Added 500ms delay to ensure database commit completes before querying
- Added refresh when dashboard tab is activated

```javascript
const handleShoutOutCreated = () => {
  setShoutoutRefresh((prev) => prev + 1);
  // Refresh summary after a short delay to ensure DB commit completes
  if (currentUser) {
    setTimeout(() => {
      fetchSummary();
    }, 500);
  }
};
```

### 2. Dashboard Tab Activation Refresh
**File**: `frontend/src/pages/Home.jsx`

- Added useEffect to refresh summary when dashboard tab becomes active
- Ensures counts are always up-to-date when viewing dashboard

```javascript
useEffect(() => {
  if (active === "dashboard" && currentUser) {
    fetchSummary();
  }
}, [active, currentUser]);
```

### 3. Cache Prevention
**File**: `frontend/src/pages/Home.jsx`

- Added timestamp query parameter to prevent browser/API caching
- Ensures fresh data is always fetched

```javascript
const response = await api.get(`/shoutouts/summary?_t=${Date.now()}`);
```

### 4. Backend Count Safety
**File**: `backend/app/routes/shoutout_router.py`

- Added `or 0` fallback to all count queries to prevent null values
- Ensures counts always return a number

```python
achievements_count = achievements_count_query.scalar_one() or 0
sent_count = sent_count_query.scalar_one() or 0
received_count = received_count_query.scalar_one() or 0
```

### 5. Improved Callback Order
**File**: `frontend/src/components/ShoutOutForm.jsx`

- Moved callback invocation after alert to ensure UI updates properly
- Better user experience with immediate feedback

## Testing Steps

1. **Test Shout-Out Creation**:
   - Go to "Shout to Employee" tab
   - Create a shout-out
   - Navigate to Dashboard
   - Verify "Shout-Outs Posted" count increases

2. **Test Achievement Creation**:
   - Go to "My Achievements" tab
   - Create an achievement
   - Navigate to Dashboard
   - Verify "Achievements" count increases

3. **Test Received Count**:
   - Have another user tag you in a shout-out
   - Navigate to Dashboard
   - Verify "Shout-Outs Received" count increases

4. **Test Tab Switching**:
   - Create a shout-out
   - Switch to another tab
   - Switch back to Dashboard
   - Verify counts are updated

## Expected Behavior

✅ Dashboard cards update immediately after creating shout-outs  
✅ Counts refresh when switching to dashboard tab  
✅ All three cards (Achievements, Posted, Received) show correct counts  
✅ Console logs show summary data being received (for debugging)  

## Debugging

If counts still don't update:
1. Check browser console for "Summary data received:" log
2. Verify the response contains correct count values
3. Check network tab to ensure API call succeeds
4. Verify backend endpoint `/shoutouts/summary` returns correct data

## API Endpoints Used

- `GET /shoutouts/summary` - Returns all dashboard summary data
  - `achievements_count`: Number of user's achievements
  - `shoutouts_sent_count`: Number of shout-outs posted by user
  - `shoutouts_received_count`: Number of shout-outs where user is tagged
  - `recent_shoutouts`: Last 5 posted shout-outs

- `GET /shoutouts/count?type=posted` - Get posted count only
- `GET /shoutouts/count?type=received` - Get received count only

All fixes are now in place and dashboard counts should update correctly! 🎉


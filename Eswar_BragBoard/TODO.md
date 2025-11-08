# Shout-Out Reporting Feature Implementation

## Backend Changes
- [ ] Add Report model to Backend/models.py
- [ ] Add report endpoints to Backend/routers/shoutouts.py:
  - POST /shoutouts/{id}/report
  - GET /shoutouts/admin/reports
  - PUT /shoutouts/admin/reports/{id}/resolve

## Frontend Changes
- [ ] Update Frontend/src/services/api.js with report methods
- [ ] Update Frontend/src/components/MainContent.jsx:
  - Add "Report" button on shout-outs in feed
  - Add report modal with reason selection
  - Extend Analytics component with "Reports" tab for admins

## Testing
- [ ] Test reporting from user perspective
- [ ] Test admin view and resolution
- [ ] Verify permissions and data integrity

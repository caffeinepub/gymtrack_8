# GymTrack

## Current State
GymTrack is a fitness app with authorization, daily workout routines, exercise tracking, health metrics, and workout history. Users log in via Internet Identity.

## Requested Changes (Diff)

### Add
- Invite link component so the admin can generate a shareable invite link
- An "Invite" page or section in the app (admin-only) to generate and copy the invite link
- When a new user opens the invite link and logs in, they are registered as a user

### Modify
- App routing to include the invite link redemption flow
- Layout/nav to include invite link management for admins

### Remove
- Nothing removed

## Implementation Plan
1. Wire the invite-links Caffeine component into the backend (already selected)
2. Add an InvitePage for admins to generate/copy the invite link
3. Add an invite redemption route (e.g. /invite/:code) that registers the user
4. Show invite management link in the nav for admins

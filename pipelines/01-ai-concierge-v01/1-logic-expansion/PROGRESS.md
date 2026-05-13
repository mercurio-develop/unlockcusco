# Stage 1: Logic Expansion

## Objective
Update the `mutateItinerary` tool to support new actions requested by the user.

## Proposed Tool Schema Update
- New Actions: `MOVE_WAYPOINT`, `CLEAR_START`, `CLEAR_END`, `SET_TRANSPORT_PROFILE`.
- New Params: `direction` (up/down), `transportProfile` (driving/walking), `legIndex` (number).

## Progress
- [x] Research existing tool logic.
- [ ] Implement schema changes.
- [ ] Verify execution block.

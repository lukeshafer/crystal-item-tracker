# Pokemon Crystal Web Item Tracker

_Note: this application is **very much** still in development. I recommend using it alongside EmoTracker or another tracker._

Goals:

- Simplify co-op item rando play by synchronizing trackers between multiple users in a shared room
- Create a fully-featured, browser-based tracker for Pokemon Crystal Item Randomizer

## Credits

Parts of this project use data and files from [https://github.com/vicendithas/pokemon-crystal-randomizer-tracker](https://github.com/vicendithas/pokemon-crystal-randomizer-tracker), by DillonIsMyName and Vicendithas, which itself is based on the tracker by StormRider. All credit goes to them and is used here with the MIT License.

## Known issues (**please read this before reporting an issue!**)

- Markers cannot be placed on more than one check.
  - This is due to a constraint on the database so that a single key item does not get placed in multiple checks. Fixing will require a rewrite of how the markers are handled (probably in their own table)
- List of checks is incomplete (mainly surrounding hidden items and berry trees)
- Related, multiple items cannot be placed on one check
  - This would be fine if we had all the checks. Right now, locations with hidden items have a single "Hidden Items" check to represent all hidden items in a location.

## Planned features

- Progression
  - Tracker shows all locations and checks right away
- Modes/variants
  - KIR vs FIR, extreme vs nightmare vs easy, etc
- Maps showing every item location (akin to warp rando tracker)
- Lock sessions to be invite-only (cannot join without an invite link)
- Change user name (it's locked per room once set)
- I'll take suggestions and requests too!

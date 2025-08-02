## Current Tasks

**Data Work**

- [ ] Continue verifying magazine publication data in source_works table
  - in progress by author: 140/500
- [ ] continue adding deep dive author data for 20 timers
  - [X] Alice Duer Miller
  - [ ] Mary Roberts Rinehart
  - [ ] Fannie Hurst
  - [ ] Edna Ferber
  - [ ] Gene Stratton-Porter
- [ ] Verify and add photoplay edition details where marked as has_photoplay_edition
  - [ ] pick up ILL library books about photoplay editions
- [ ] transfer availability info from ~130 films in previous dataset
- [ ] add test plot summary to see how it will display on site - done just need to rebuild and check GPB work

**Technical Fixes**

- [ ] fix work archive link section to not show if null?? attempted this but it's complicated - revisit
- [ ] Implement decade filter for authors (needs active decades in index)
- [ ] add pattern badge for works that appeared first in magazines
- [ ] Add more fields to author detail pages (education, archives, awards from authors_rows.csv)
- [ ] implement grid view for authors and works
- [ ] add number of loaded films to SPA url so that the back button works

**Pattern Pages**

- [ ] draft Elastic Classic page & figure out what data is needed
- [ ] Completely rewrite Hot Off the Press with real example films from the data
  - [ ] Create case study timelines with actual films for Hot Off the Press - pick a few
  - [x] Add real genre data to enable genre breakdown chart
- [ ] Write content for the authors' studios pattern page using research notes
- [ ] Write content for "Himbos" pattern page

**Content Writing**
- [ ] Write mini deep dives for Twenty-Timers members (use the template structure)
  - [ ] Alice Duer Miller - started
  - [ ] Mary Roberts Rinehart
  - [ ] Fannie Hurst
  - [ ] Edna Ferber
  - [ ] Gene Stratton-Porter
- [ ] Complete methodology notes for remaining pattern pages
- [ ] Write individual pattern page introductions based on actual counts

**Visual/Media**
- [ ] Find and add author portraits from Wikimedia for pattern pages
  - [ ] 10 timers club
- [ ] Add book covers from HathiTrust/Internet Archive where available
- [ ] continuing verifying and pruning film media

**Documentation**
- [ ] Create About page with research journey
- [ ] Create "How to Navigate" guide for users - beta testers first
- [ ] Add citation format for researchers
- [ ] Write data correction submission process

**Quality Checks**
- [ ] Spot-check 10-20 entries per entity type for accuracy
- [ ] Test all database filters with real searches
- [ ] Verify all numbers shown on pattern pages match actual data
- [ ] Check that pattern badges appear correctly in list views


### Tasks for Student Workers

- Add exact release dates for films to enable magazine→film timeline visualization
- Spot check magazine data OR film data
- Add film runtimes
- Add other stuff??




### Finished

- [x] separate genres from subgenres/topics in supabase
- [x] Fix author nationality filter to match updated field structure
- [x] add links to digitized magazines on work detail pages
- [x] Make film/work title formatting consistent across all views - probably done?
- [x] Add footer to database
- [x] get WM images displaying on film detail pages
~~- [ ] Add superscript film count indicators for authors with 10+ films?~~ SKIP THIS FOR NOW
- [x] Redo pattern badges in list view - use typographical symbols with css styling
  - [x] twenty-timers (stacked asterisks)
  - [x] hot off the press (lightning bolt)
  - [x] elastic classic (four dots)
- [x] figure out how to use featured poster image in grid view
- [x] add missing wikidata ids for films
  - [x] run enrichment to add external ids based on wikidata id
  - [x] run tmdb enrichment to get images 
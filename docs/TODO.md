## Reorganized Work Plan

### 🎯 **Quick Wins Bundle** (Mix of easy tasks for momentum)
- [x] Add test plot summary to see how it will display on site - looks great, first section of page after title
- [x] Fix work archive link section separator line issue
- [ ] Add citation format for researchers (in footer or about page)

### 📊 **Data → Visual Pipeline 1: Works Grid View**
*These tasks build on each other but mix data and technical work*
1. [ ] Add plot summaries for 10-20 important source works (test batch)
2. [ ] Verify and add photoplay edition details for same works
3. [ ] Add book covers from HathiTrust/IA for these works
4. [ ] Implement grid view for works (now you have visuals to display!)

### 📊 **Data → Visual Pipeline 2: Authors Enhancement**
1. [ ] Continue magazine publication data verification (set limit: 50 more authors)
2. [ ] Add more fields to author detail pages from CSV
3. [ ] Find/add author portraits for 10-timers club
4. [ ] Implement grid view for authors
5. [ ] Add Wikidata IDs for ~100 authors 

### 📝 **Pattern Page Sprint: Elastic Classics**
*Complete one pattern page from data to content*
1. [ ] Figure out what data is needed for Elastic Classics
2. [ ] Run any necessary data queries/analysis
3. [ ] Draft Elastic Classics page content
4. [ ] Add methodology notes for this page

### 🎨 **Hot Off the Press Completion**
*Finish what's already started*
1. [ ] Pick 3-5 case study films from the data
2. [ ] Create timeline visualizations for these films
3. [ ] Rewrite content sections with real examples
4. [ ] Add methodology notes

### 👤 **Twenty-Timer Deep Dive: Pick ONE**
*Complete one author fully before moving to next*
1. [ ] Mary Roberts Rinehart (most films, good test case)
   - [ ] Add deep dive data
   - [ ] Write mini deep dive content
   - [ ] Find/add portrait
   - [ ] Verify all her films have correct data

### 🔧 **Technical Improvements Sprint**
1. [ ] Implement decade filter for authors
2. [ ] Fix authors filter for works
3. [ ] Add URL state for pagination (back button fix)
4. [ ] Test all database filters with real searches
5. [ ] Add pattern badge for works that appeared first in magazines
6. [ ] Verify pattern badges display correctly

### 📚 **Documentation Package**
*Do these together when you're in writing mode*
1. [ ] Create "How to Navigate" guide
2. [ ] Write About page with research journey
3. [ ] Document data correction submission process

### 🎭 **Fun Content Break: Himbos Page**
*When you need a lighter task*
1. [ ] Write content for "Himbos" pattern page
2. [ ] Find amusing male lead photos if available
3. [ ] Add methodology notes with a wink

### 🔍 **Quality Control Session**
*Schedule this when you have uninterrupted time*
1. [ ] Continue film media verification/pruning
2. [ ] Spot-check 10 entries per entity type
3. [ ] Verify all pattern page numbers match data
4. [ ] Transfer availability info from previous dataset

### 📚 **Student Worker Prep Package**
*Prepare clear tasks for delegation*
1. [ ] Create spreadsheet of films needing exact release dates
2. [ ] List of authors needing magazine data verification
3. [ ] Films missing runtime data
4. [ ] Clear instructions/examples for each task

## Suggested Work Rhythm

**Week 1**: Quick Wins Bundle + Start Data→Visual Pipeline 1

**Week 2**: Complete Pipeline 1 + Hot Off the Press

**Week 3**: Twenty-Timer Deep Dive + Technical Sprint

**Week 4**: Pattern Page Sprint + Documentation

This way you're always mixing:
- Data entry with visual results
- Technical fixes with content writing  
- Deep research with quick wins
- Solo work with student worker prep



---

## Current Tasks broken out by type

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
- [ ] add plot summaries for important source works

**Technical Fixes**

- [ ] fix work archive link section to not show if null?? attempted this but it's complicated - revisit
- [ ] Implement decade filter for authors (needs active decades in index)
- [ ] add pattern badge for works that appeared first in magazines
- [ ] Add more fields to author detail pages (education, archives, awards from authors_rows.csv)
- [ ] implement grid view for authors and works - big time commitment
- [ ] add number of loaded films to SPA url so that the back button works when past first the first 50 results

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
- [x] add test plot summary to see how it will display on site - GPB work

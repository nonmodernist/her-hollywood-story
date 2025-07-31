# Adapted from American Women: Database Workflow Guide

## Overview
This project maintains a database of American women writers whose works were adapted into films (1910-1960). The workflow consists of three phases: Core Data Entry, Data Enrichment, and Publishing.

## Directory Structure
```
adapted-from-women/
├── back-end-scripts/
│   ├── 01_enrichment/          # All enrichment scripts
│   │   ├── authors/
│   │   │   └── wikidata_authors.py
│   │   ├── films/
│   │   │   ├── new_afi_catalog.py
│   │   │   ├── wikidata_films.py
│   │   │   └── lost_films.py
│   │   └── media/
│   │       ├── wikimedia_author_search_twenty_timers.py
│   │       └── wikimedia_commons_search_fixed.py
│   │
│   ├── 02_upload/              # Scripts that upload to Supabase
│   │   └── upload_zotero.py
│   │
│   └── 03_export/              # Export and publishing scripts
│       └── export_for_website.py
│
├── back-end-data/
│   │ ├── films_rows.csv
│   │ ├── film_media.csv
│   │ ├── authors.csv
│   │ └── source_works.csv
│   ├── temp/                   # Temporary enrichment outputs
│   └── reference/              # Reference data (e.g., lost films list)
│
└── docs/
    ├── workflow.md             # This document
    └── data-structure.md       # Database field documentation
```

## Phase 1: Core Data Entry (Manual in Supabase)

### Required Order:
1. **Authors** → Add to `authors` table
2. **Source Works** → Add to `source_works` table (requires author_id)
3. **Films** → Add to `films` table (requires source_work_id)

### Key Fields to Track:
- Authors: name, pseudonyms (in notes)
- Source Works: title, author_id, publication_year
- Films: title, release_year, source_work_id

## Phase 2: Data Enrichment (Automated Scripts)

### A. Author Enrichment
**Script:** `back-end-scripts/01_enrichment/authors/wikidata_authors.py`
- **Input:** Reads from `authors` table
- **Output:** Updates Supabase directly
- **Adds:** birth/death years, nationality, literary movement, biographical notes, wikidata_id
- **When to run:** After adding new authors

### B. Film Enrichment

#### B1. AFI Catalog
**Script:** `back-end-scripts/01_enrichment/films/new_afi_catalog.py`
- **Input:** Reads from `films` table or from exported table of selected films
- **Output:** Updates Supabase directly
- **Adds:** AFI catalog ID, directors, writers, cast, production companies

#### B2. Wikidata Films
**Script:** `back-end-scripts/01_enrichment/films/wikidata_films.py`
- **Input:** Reads from `films` table
- **Output:** Updates Supabase directly
- **Adds:** Runtime, country of production, color_info

#### B3. Lost Films Check
**Script:** `back-end-scripts/01_enrichment/films/lost_films.py`
- **Input:** Reads from `films` table + `back-end-data/reference/lost_films_list.pdf`
- **Output:** Updates Supabase directly
- **Adds:** availability
- **When to run:** After major film additions

### C. Media Collection
**Scripts:** 
- `back-end-scripts/01_enrichment/media/wikimedia_commons_search_fixed.py`
- `back-end-scripts/01_enrichment/media/wikimedia_author_search_twenty_timers.py`
- **Input:** Reads from `films` table
- **Output:** Updates Supabase `film_media` table directly
- **Adds:** Posters, stills, promotional materials from Wikimedia
- **When to run:** After adding new films or periodically for all films
- **Next step:** Manually check `film_media` table for false positives and high quality images to feature

### D. Citation Import
**Script:** `back-end-scripts/02_upload/upload_zotero.py`
- **Input:** JSON export from Zotero
- **Output:** Updates Supabase `citations` table
- **Process:** Export from Zotero as JSON → Run script
- **When to run:** When new academic sources are found

## Phase 3: Publishing to Website

**Script:** `back-end-scripts/03_export/export_for_website.py`
- **Function:** Exports all required tables from Supabase as CSVs
- **Output:** 
  - `back-end-data/exports/authors_rows.csv`
  - `back-end-data/exports/source_works_rows.csv`
  - `back-end-data/exports/films_rows.csv`
  - `back-end-data/exports/film_media.csv`
- **Next step:** Copy files to website's `back-end-data/` directory and push to GitHub

## Recommended Batch Processing Workflow

### For New Entries:
1. **Core Data Entry** (Supabase)
   - Add all authors
   - Add all source works
   - Add all films

2. **Run Enrichment Suite** (in order):
   ```bash
   # Authors
   python3 back-end-scripts/01_enrichment/authors/wikidata_authors.py
   
   # Films
   python3 back-end-scripts/01_enrichment/films/wikidata_films.py
   python3 back-end-scripts/01_enrichment/films/new_afi_catalog.py
   
   # Media
   python3 back-end-scripts/01_enrichment/media/wikimedia_commons_search_fixed.py
   python3 back-end-scripts/01_enrichment/media/wikimedia_author_search_twenty_timers.py
   ```

3. **Check Lost Films** (optional)
   ```bash
   python3 back-end-scripts/01_enrichment/films/lost_films.py
   ```

4. **Export and Publish**
   ```bash
   python3 back-end-scripts/03_export/export_for_website.py
   # Then manually copy CSVs to website and push to GitHub
   ```

### For Maintenance Updates:
- Run individual enrichment scripts as needed
- Always run export script after any database changes
- Consider setting up a monthly task to run lost films check

## Script Naming Convention

### Enrichment Scripts (01_enrichment/)
- Named by: `[source]_[target].py`
- Examples: `wikidata_authors.py`, `google_books.py`

### Upload Scripts (02_upload/)
- Named by: `upload_[source]_[target].py`
- Examples: `upload_wikidata_films.py`, `upload_google_books.py`

### Direct Update Scripts
- Scripts that update Supabase directly should include a comment at the top:
  ```python
  # DIRECT UPDATE: This script updates Supabase directly
  # No intermediate CSV required
  ```

## Quick Reference Card

| Task                    | Script                                                                          | Output             |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------ |
| Enrich authors          | `wikidata_authors.py`                                                           | Direct to Supabase |
| Enrich films (Wikidata) | `wikidata_films.py`                                                             | Direct to Supabase |
| Enrich films (AFI)      | `new_afi_catalog.py`                                                            | Direct to Supabase |
| Check lost films        | `lost_films.py`                                                                 | Direct to Supabase |
| Collect media           | `wikimedia_commons_search_fixed.py`, `wikimedia_author_search_twenty_timers.py` | Direct to Supabase |
| Import citations        | `upload_zotero.py`                                                              | Direct to Supabase |
| Export for website      | `export_for_website.py`                                                         | 4 CSV files        |

## Automation Opportunities

Consider creating a master script `run_full_enrichment.py` that:
1. Runs all enrichment scripts in proper order
2. Handles CSV uploads automatically
3. Exports final CSVs
4. Shows progress and any errors

## Backup Strategy

Before running any enrichment:
1. Export current data using Supabase's backup feature
2. Keep versioned backups in `back-end-data/backups/YYYY-MM-DD/`
3. Test scripts on a small subset first

## Troubleshooting

Common issues and solutions:
- **API rate limits**: Add delays between requests in enrichment scripts
- **Duplicate entries**: Check for existing data before inserting
- **Missing dependencies**: Maintain a `requirements.txt` file
- **Field mapping errors**: Document all field mappings in `docs/data-structure.md`
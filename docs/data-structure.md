# Data Structure Evolution

## Works

### Photoplay Editions
- **Original**: Fields directly on works table
- **Current**: Separate photoplay_editions table
- **TODO**: Join photoplay data during build or create separate endpoint

### Current Work Fields Available in CSV / json
- title
- author_id
- publication_year
- work_type
- genre
- plot_summary
- literary_significance
- magazine_title (when published in magazine)
- magazine_pub_date
- magazine_issue_info
- serialized (boolean)
- serial_parts (number)
- has_photoplay_edition (boolean flag only)
- digitized_url
- FMI_link


#### Fields Needing Integration into build process
- Photoplay edition details (from separate table)

### current fields used in database-app.js
- html_title
- author: slug, name
- work_type
- publication_year
- patterns
- plot_summary
- literary_significance
- magazine_publication: mag title, pub date, issue info, serialized, serial parts, digitized url, FMI_link
- has_photoplay_edition
- adaptation_count
- adaptations: film slug, html title, year, studio, director
- adaptation_gaps


## Authors

### Current author Fields Available in json

- id
- slug
- name
- birth_year
- death_year
- nationality
- literary_movement
- biographical_notes
- author_notes
- wikidata_id
- stats
- patterns
  - is_twenty_timer
  - twenty_timer_rank
- films
- adapted works
- most_adapted_work
- has_narrative - DEPRECATED
- last_updated

#### fields needing integration into build process

- alternative_names,occupations,key_themes,education,maiden_name,key_associations,major_awards,archives_locations,modern_availability,has_extended_narrative,has_timeline_data,has_portrait,signature_work_ids,has_pseudonym,is_pseudonym

### fields in use in database-app.js

- name
- birth_year
- death_year
- total_films
- works_adapted
- first_adaptation
- last_adaptation
- biographical_notes
- adapted_works: slug, html title, publication year, adaptation count
- films: slug, html title, year

#### fields needing integration into site

- 


## Films

### Current film fields available in json

- unique film id
- slug
- title
- formatted_title
- html_title
- release_year
- runtime_minutes
- country_of_production
- genres
- studio
- production_companies
- distribution_companies
- directors
- writers
- cast_members
- color_info
- adaptation_notes
- afi_catalog_id
- source_work info
  - "id"
  - "slug"
  - "title"
  - "formatted_title"
  - "html_title"
  - "work_type"
  - "publication_year"
  - "genre"
  - "plot_summary"
  - "literary_significance"
  - "adaptation_count"
  - "year_to_adaptation"
- author_info
  - "id"
  - "slug"
  - "name"
  - "birth_year"
  - "death_year"
  - "nationality"
  - "film_count"
- other_adaptations
- adaptation_context
  - "is_remake" (boolean)
  - "total_adaptations"
  - "adaptation_number"
  - "is_first" (boolean)
  - "is_latest" (boolean)
- media
  - id
  - type
  - is_featured (boolean)
  - etc etc 
- has_media (boolean)
- media_count
- has_narrative (boolean)
- last-updated

#### Fields Needing Integration into build process

- availability,archive_location,verification_source,women_in_key_roles,


### Fields currently in use in database-app.js

- html_title
- release_year
- studio
- runtime_minutes
- directors
- writers
- cast_members
- genres
- source_work slug
- author slug
- source_work pub_year
- source_work year_to_adaptation
- other_adaptations
- media (length/amount)


#### Fields Needing Integration into Site

- actual media urls
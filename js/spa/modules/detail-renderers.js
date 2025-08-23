// detail-renderers.js - Detail view rendering functions

import { 
    BASE_PATH, 
    formatNameList, 
    formatMagazineDate,
    getDatabaseURL,
    capitalizeFirst,
    parseArrayField
} from './database-config.js';

// Render detail view based on type
export function renderDetailView(type, data) {
    const basePath = window.location.pathname.split('/database/')[0] + '/database';

    let html = `
    `;

    switch (type) {
        case 'film':
            html += renderFilmDetail(data);
            break;
        case 'author':
            html += renderAuthorDetail(data);
            break;
        case 'work':
            html += renderWorkDetail(data);
            break;
    }

    return html;
}

// Render film detail
export function renderFilmDetail(film) {
    return `
        <div>
            <h1>${film.html_title}</h1>
            <div class="detail-subtitle font-sans">
                ${film.release_year} · ${film.studio || 'Unknown Studio'}
                ${film.runtime_minutes ? ` · ${film.runtime_minutes} minutes` : ''}
            </div>
            
            <div class="detail-sections">
                <section class="detail-section">
                    <h2>Film Details</h2>
                    ${film.directors ? `<p><strong>Director:</strong> ${formatNameList(film.directors)}</p>` : ''}
                    ${film.writers ? `<p><strong>Screenwriter:</strong> ${formatNameList(film.writers)}</p>` : ''}
                    ${film.cast_members ? `<p><strong>Cast:</strong> ${formatNameList(film.cast_members)}</p>` : ''}
                    ${film.genres?.length ? `<p><strong>Genres:</strong> ${film.genres.join(', ')}</p>` : ''}
                    
                    ${renderAvailabilityContent(film)}
                    ${renderExternalLinksContent(film)}
                </section>

                                ${film.media?.length ? `
                    <section class="detail-section">
                        <h2>Media Gallery</h2>
                        <div class="media-gallery">
                            ${film.media.map(media => `
                                <div class="media-item">
                                    <a href="${media.url}" target="_blank" rel="noopener">
                                        <img src="${media.thumbnail_url}" alt="${media.caption || media.title}" loading="lazy">
                                    </a>
                                    <div class="media-caption font-sans">
                                        ${media.caption ? `<p>${media.caption}</p>` : ''}
                                        <small>Source: ${media.source} ${media.attribution ? `· ${media.attribution}` : ''}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                
                <section class="detail-section">
                    <h2>Source Work</h2>
                    <p><strong>Title:</strong> <a href="${getDatabaseURL('/work/' + film.source_work.slug)}">${film.source_work.html_title}</a></p>
                    <p><strong>Author:</strong> <a href="${getDatabaseURL('/author/' + film.author.slug)}">${film.author.name}</a></p>
                    ${film.source_work.publication_year ? `<p><strong>Published:</strong> ${film.source_work.publication_year}</p>` : ''}
                    ${film.source_work.year_to_adaptation !== null && film.source_work.year_to_adaptation !== undefined ? `<p><strong>Years to adaptation:</strong> ${film.source_work.year_to_adaptation}</p>` : ''}
                    ${film.source_work.photoplay_edition_count > 0 ? `
                        <p><strong>Photoplay Editions:</strong> 
                            ${film.source_work.photoplay_edition_count} known edition${film.source_work.photoplay_edition_count !== 1 ? 's' : ''}
                        </p>
                    ` : ''}
                
                ${film.other_adaptations?.length ? `
                        <h3>Other Adaptations of This Work</h3>
                        <div class="relation-list relation-list--siblings">
                            ${film.other_adaptations.map(f => `
                                <div class="relation-list__item">
                                    <a href="${getDatabaseURL('/film/' + f.slug)}">${f.html_title}</a>
                                    <span class="relation-list__meta font-sans">${f.year || 'Unknown'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
                

            </div>
        </div>
    `;
}

// Render availability and archive location content
export function renderAvailabilityContent(film) {
    // Check if we have any availability or archive data
    const hasAvailability = film.availability && film.availability !== null;
    const hasArchiveLocation = film.archive_location && film.archive_location !== null;
    
    if (!hasAvailability && !hasArchiveLocation) {
        return '';
    }
    
    let availabilityHTML = '';
    
    // Process availability status
    if (hasAvailability) {
        const availabilityStatuses = film.availability.split('|').map(status => {
            const trimmedStatus = status.trim();
            switch (trimmedStatus) {
                case 'lost': return 'This film is considered lost';
                case 'extant': return 'Preserved in archives';
                case 'streaming': return 'Available on streaming platforms';
                case 'home_video': return 'Available on DVD/Blu-ray';
                case 'public_domain': return 'In the public domain';
                case 'restricted': return 'Access restricted';
                default: return trimmedStatus;
            }
        });
        
        availabilityHTML += `<p class="detail-text"><strong>Status:</strong> ${availabilityStatuses.join(' · ')}</p>`;
    }
    
    // Process archive location
    if (hasArchiveLocation) {
        const parts = film.archive_location.split(';');
        const physicalArchives = parts[0] ? parts[0].trim() : '';
        const digitalStreaming = parts[1] ? parts[1].trim() : '';
        
        if (physicalArchives) {
            availabilityHTML += `<p class="detail-text"><strong>Archive Locations:</strong> ${physicalArchives}</p>`;
        }
        
        if (digitalStreaming) {
            const streamingLinks = digitalStreaming.split(',').map(platform => {
                const trimmedPlatform = platform.trim();
                
                if (trimmedPlatform.includes('Internet Archive (free)')) {
                    const searchQuery = encodeURIComponent(`${film.title} ${film.release_year}`);
                    return `<a href="https://archive.org/details/feature_films?tab=collection&query=${searchQuery}" target="_blank" rel="noopener">Internet Archive</a> (free)`;
                } else if (trimmedPlatform.includes('YouTube (free)')) {
                    const searchQuery = encodeURIComponent(`${film.title} ${film.release_year}`);
                    return `<a href="https://www.youtube.com/results?search_query=${searchQuery}" target="_blank" rel="noopener">YouTube</a> (free)`;
                } else if (trimmedPlatform.includes('Criterion Channel (subscription)')) {
                    return 'Criterion Channel (subscription required)';
                } else {
                    return trimmedPlatform;
                }
            });
            
            availabilityHTML += `<p class="detail-text"><strong>Streaming:</strong> ${streamingLinks.join(' · ')}</p>`;
        }
    }
    
    return `
        <h4 class="detail-subheading">Availability & Access</h4>
        ${availabilityHTML}
    `;
}

// Render external database links content
export function renderExternalLinksContent(film) {
    const hasAFI = film.afi_catalog_id && film.afi_catalog_id !== null;
    const hasIMDb = film.imdb_id && film.imdb_id !== null;
    
    if (!hasAFI && !hasIMDb) {
        return '';
    }
    
    let linksHTML = '';
    
    if (hasAFI) {
        linksHTML += `
            <p class="external-link font-sans">
                <a href="https://catalog.afi.com/Catalog/moviedetails/${film.afi_catalog_id}" target="_blank" rel="noopener">
                    View in AFI Catalog →
                </a>
            </p>
        `;
    }
    
    if (hasIMDb) {
        linksHTML += `
            <p class="external-link font-sans">
                <a href="https://www.imdb.com/title/${film.imdb_id}/" target="_blank" rel="noopener">
                    View on IMDb →
                </a>
            </p>
        `;
    }
    
    return `
        <h4 class="detail-subheading">External Resources</h4>
        ${linksHTML}
    `;
}

// Render author detail
export function renderAuthorDetail(author) {
    // Parse array fields
    const occupations = parseArrayField(author.occupations);
    const themes = parseArrayField(author.key_themes);
    const associations = parseArrayField(author.key_associations);
    const archives = parseArrayField(author.archives_locations);
    const alternativeNames = parseArrayField(author.alternative_names);
    
    // Get signature works if IDs are provided
    const signatureWorkIds = parseArrayField(author.signature_work_ids);
    const signatureWorks = signatureWorkIds.length > 0 ? 
        author.adapted_works.filter(work => signatureWorkIds.includes(String(work.id))) : 
        [];
    
    
    return `
        <div>
            <h1>${author.name}</h1>
            ${author.birth_year || author.death_year || author.nationality ? `
                <div class="detail-subtitle font-sans">
                    ${author.birth_year || '?'}–${author.death_year || '?'}
                    ${author.nationality ? ` · ${author.nationality}` : ''}
                </div>
            ` : ''}
            
            <div class="stats-bar">
                <div class="stat">
                    <div class="stat-number">${author.stats.total_films}</div>
                    <div class="stat-label">Films</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${author.stats.works_adapted}</div>
                    <div class="stat-label">Works Adapted</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${author.stats.first_adaptation === author.stats.last_adaptation ? author.stats.first_adaptation : `${author.stats.first_adaptation}–${author.stats.last_adaptation}`}</div>
                    <div class="stat-label">Adaptation Period</div>
                </div>
            </div>
            
            <div class="detail-sections">
                ${author.biographical_notes ? `
                    <section class="detail-section enhanced-bio-area">
                        ${author.has_portrait ? `
                            <img class="author-portrait" 
                                 src="${BASE_PATH}/images/authors/${author.slug || author.name.toLowerCase().replace(/\s+/g, '-')}.jpg" 
                                 alt="Portrait of ${author.name}"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="bio-content">
                            <h2>Biography</h2>
                            <div class="formatted-text">${author.biographical_notes_html || author.biographical_notes}</div>
                        </div>
                    </section>
                ` : ''}

                ${signatureWorks.length > 0 ? `
                    <section class="detail-section signature-works-section">
                        <h2>Signature Works</h2>
                        <div class="signature-works">
                            ${signatureWorks.map(work => `
                                <div class="signature-work-card">
                                    <a href="${getDatabaseURL('/work/' + work.slug)}">${work.html_title}</a>
                                    <div class="work-details">
                                        ${work.publication_year || 'Year unknown'} • ${work.adaptation_count} adaptation${work.adaptation_count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                    </section>
                ` : ''}
                
                ${(alternativeNames.length > 0 || author.education || occupations.length > 0 || 
                   author.major_awards || author.literary_movement || themes.length > 0 || associations.length > 0 || archives.length > 0 || author.modern_availability) ? `
                    <section class="detail-section about-author">
                        <h2>Author Details</h2>
                        
                        ${alternativeNames.length > 0 ? `
                            <div class="info-row">
                                <strong>Also known as:</strong> ${alternativeNames.join(', ')}
                            </div>
                        ` : ''}
                        
                        ${author.education || occupations.length > 0 || author.major_awards || author.literary_movement ? `
                            <div class="professional-life">
                                <h4 class="detail-subheading">Professional Life</h4>
                                ${author.education ? `<p class="detail-text"><strong>Education:</strong> ${author.education}</p>` : ''}
                                ${occupations.length > 0 ? `<p class="detail-text"><strong>Occupations:</strong> ${occupations.join(', ')}</p>` : ''}
                                ${author.major_awards ? `<p class="detail-text"><strong>Major Awards:</strong> ${author.major_awards.replace(/^\[|\]$/g, '').replace(/'/g, '').split(', ').join(', ')}</p>` : ''}
                                ${author.literary_movement ? `<p class="detail-text"><strong>Literary Movement:</strong> ${author.literary_movement}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${themes.length > 0 ? `
                            <div class="themes-section">
                                <h4 class="detail-subheading">Themes & Subjects</h4>
                                <div class="pseudo-tags">
                                    ${themes.map(theme => `<span class="pseudo-tag">${theme}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${associations.length > 0 ? `
                            <div class="associations-section">
                                <h4 class="detail-subheading">Key Associations</h4>
                                <p class="detail-text">${associations.join(', ')}</p>
                            </div>
                        ` : ''}

                        ${archives.length > 0 ? `
                            <div class="archival-collections">
                                <h4 class="detail-subheading">Archival Collections</h4>
                                <p class="detail-text">${archives.join(', ')}</p>
                            </div>
                        ` : ''}

                        ${author.modern_availability ? `
                            <div class="modern-availability">
                                <h4 class="detail-subheading">Modern Availability</h4>
                                <p class="detail-text">${author.modern_availability}</p>
                            </div>
                        ` : ''}
                    </section>
                ` : ''}
                
                <section class="detail-section">
                    <h2>Adapted Works</h2>
                    <div class="relation-list relation-list--bibliography">
                        ${author.adapted_works.map(work => `
                            <div class="relation-list__item">
                                <a href="${getDatabaseURL('/work/' + work.slug)}">${work.html_title}</a>
                                <span class="relation-list__meta font-sans">${work.publication_year || 'Publication year unknown'} · ${work.adaptation_count} film${work.adaptation_count !== 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <section class="detail-section">
                    <h2>Films</h2>
                    <div class="relation-list relation-list--filmography">
                        ${author.films.map(film => `
                            <div class="relation-list__item">
                                <a href="${getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
                                <span class="relation-list__meta font-sans">${film.year || 'Unknown'}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}

// Render work detail
export function renderWorkDetail(work) {
    return `
        <div>
            <h1>${work.html_title}</h1>
            <div class="detail-subtitle font-sans">
                by <a href="${getDatabaseURL('/author/' + work.author.slug)}">${work.author.name}</a>${work.attribution_notes ? ` and ${work.attribution_notes.replace('co-writer ', '').replace('co-writers ', '')}` : ''} · 
                ${capitalizeFirst(work.work_type?.replace('_', ' ') || 'Unknown type')} · 
                ${work.publication_year || 'Publication year unknown'}
            </div>
            
            <div class="detail-sections">
                ${work.plot_summary ? `
                    <section class="detail-section">
                        <h2>Plot Summary</h2>
                        <div class="formatted-text">${work.plot_summary_html || work.plot_summary}</div>
                    </section>
                ` : ''}
                
                ${work.literary_significance ? `
                    <section class="detail-section">
                        <h2>Literary Significance</h2>
                        <div class="formatted-text">${work.literary_significance_html || work.literary_significance}</div>
                    </section>
                ` : ''}

                <!-- Magazine Publication Section -->
                ${work.magazine_publication ? `
                    <section class="detail-section">
                        <h2>Original Publication</h2>
                        <p><strong>${work.magazine_publication.magazine_title}</strong>${work.magazine_publication.magazine_pub_date ? ` · ${formatMagazineDate(work.magazine_publication.magazine_pub_date)}` : ''}</p>
                        
                        ${work.magazine_publication.magazine_issue_info ?
                `<p class="issue-info">${work.magazine_publication.magazine_issue_info}</p>` : ''}
                        
                        ${work.magazine_publication.serialized && work.magazine_publication.serial_parts ?
                `<p class="serialization-note font-sans">Serialized in ${work.magazine_publication.serial_parts} parts</p>` : ''}
            
                <!-- Archive Links Section -->
        ${(work.magazine_publication.digitized_url || work.magazine_publication.FMI_link) ? `
            <div class="archive-links">
                ${work.magazine_publication.digitized_url ? `
                    <p class="archive-link font-sans">
                        <a href="${work.magazine_publication.digitized_url}" 
                           target="_blank" 
                           rel="noopener">
                            Read the full magazine issue →
                        </a>
                    </p>
                ` : ''}
                
                ${work.magazine_publication.FMI_link ? `
                    <p class="external-link font-sans">
                        <a href="${work.magazine_publication.FMI_link}" 
                           target="_blank" 
                           rel="noopener">
                            View in FictionMags Index →
                        </a>
                    </p>
                ` : ''}
            </div>
        ` : ''}</section>
                ` : ''}
                
                <!-- External Book Links Section -->
                ${work.external_urls && work.external_urls.length > 0 ? `
                    <section class="detail-section">
                        <h2>Read the Book</h2>
                        ${(() => {
                            // Sort by priority
                            const sortedUrls = work.external_urls.sort((a, b) => a.priority - b.priority);
                            
                            // Apply display logic
                            let filteredUrls = [];
                            let hasInternetArchive = sortedUrls.some(url => url.source === 'Internet Archive');
                            
                            for (let url of sortedUrls) {
                                // Always include Project Gutenberg and Internet Archive
                                if (url.source === 'Project Gutenberg' || url.source === 'Internet Archive') {
                                    filteredUrls.push(url);
                                }
                                // Only include Open Library if no Internet Archive
                                else if (url.source === 'Open Library' && !hasInternetArchive) {
                                    filteredUrls.push(url);
                                }
                                // Only include WorldCat if no other links
                                else if (url.source === 'WorldCat' && filteredUrls.length === 0) {
                                    filteredUrls.push(url);
                                }
                            }
                            
                            return filteredUrls.map(url => `
                                <p class="external-link font-sans">
                                    <a href="${url.url}" target="_blank" rel="noopener">
                                        ${url.source} →
                                    </a>
                                </p>
                            `).join('');
                        })()}
                    </section>
                ` : ''}
                
                <!-- Premium Photoplay Showcase -->
                ${work.photoplay_editions?.length ? `
                    <section class="detail-section">
                        <h2>Photoplay Editions (${work.photoplay_editions.length})</h2>
                        
                        <div class="photoplay-showcase">
                            <div class="photoplay-showcase__editions">
                                ${work.photoplay_editions.map(edition => {
                                    const heroImage = edition.media?.find(m => ['dust_jacket', 'cover', 'title_page'].includes(m.media_type)) || edition.media?.[0];
                                    const secondaryImages = edition.media?.filter(m => m !== heroImage).slice(0, 3) || [];
                                    
                                    return `
                                        <article class="photoplay-edition">
                                            ${heroImage ? `
                                                <div class="photoplay-edition__hero">
                                                    <a href="${edition.ia_url}" target="_blank" rel="noopener">
                                                        <img src="${heroImage.ia_url}" 
                                                             alt="${edition.publisher || 'Unknown publisher'} photoplay edition cover"
                                                             class="photoplay-edition__hero-image"
                                                             loading="lazy">
                                                    </a>
                                                </div>
                                            ` : ''}
                                            
                                            <div class="photoplay-edition__content">
                                                <h3 class="photoplay-edition__title">
                                                    ${edition.publisher || 'Unknown Publisher'}
                                                    ${edition.binding_type && edition.binding_type !== 'unknown' ? ` ${edition.binding_type}` : ''}
                                                </h3>
                                                
                                                <p class="photoplay-edition__subtitle">
                                                    ${(edition.country && edition.country !== 'unknown') ? `${edition.country} edition, published` : 'Published'} circa ${edition.edition_year || 'date unknown'}${edition.series_info ? ` · ${edition.series_info}` : ''}
                                                </p>
                                                
                                                <p class="photoplay-edition__description font-sans">
                                                    Created to promote the ${edition.film_year} film adaptation 
                                                    <a href="${getDatabaseURL('/film/' + edition.film_slug)}">
                                                        <em>${edition.film_title}</em>
                                                    </a>${edition.cover_type || edition.photo_content ? `. Features ${[edition.cover_type, edition.photo_content].filter(Boolean).join(' and ').toLowerCase()}` : ''}.
                                                </p>
                                                
                                                
                                                ${secondaryImages.length ? `
                                                    <div class="photoplay-edition__gallery">
                                                        ${secondaryImages.map(img => `
                                                            <a href="${edition.ia_url}" target="_blank" rel="noopener" class="photoplay-edition__gallery-item">
                                                                <img src="${img.ia_url}" 
                                                                     alt="${img.caption || 'Additional page'}"
                                                                     loading="lazy">
                                                            </a>
                                                        `).join('')}
                                                    </div>
                                                ` : ''}
                                                
                                                ${edition.edition_description ? `
                                                    <div class="photoplay-edition__specs">
                                                        <p class="specs__item"><span class="specs__term">Notes:</span> <span class="specs__description">${edition.edition_description}</span></p>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </article>
                                    `;
                                }).join('')}
                            </div>
                            
                            <div class="attribution">
                                <p class="attribution__note">
                                    Photoplay editions are typically undated. Years shown are generally estimates based on film release dates 
                                    and publisher catalogs. Images courtesy of the researcher's private collection.
                                </p>
                            </div>
                        </div>
                    </section>
                ` : ''}
                
                    <section class="detail-section">
                    <h2>Film Adaptation${work.stats.adaptation_count > 1 ? 's' : ''} (${work.stats.adaptation_count})</h2>
                    <div class="relation-list relation-list--adaptations">
                        ${work.adaptations.map((film, index) => `
                            <div class="relation-list__item">
                                <span class="adaptation-number font-sans">#${index + 1}</span>
                                <div class="adaptation-info">
                                    <a href="${getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
                                    <div class="relation-list__meta font-sans">
                                        ${film.year || 'Unknown'} · ${film.studio || 'Unknown Studio'}
                                        ${film.directors ? ` · Dir: ${film.directors}` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}
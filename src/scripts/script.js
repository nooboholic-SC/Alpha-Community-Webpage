
        // Configuration
        const SERVER_ID = "1172812733100609547";
        const STATS_FILE = 'discord-stats.json'; // For GitHub Actions updates
        
        // DOM Elements
        const serverNameEl = document.getElementById('serverName');
        const onlineCountEl = document.getElementById('onlineCount');
        const totalMembersEl = document.getElementById('totalMembers');
        const voiceChannelsEl = document.getElementById('voiceChannels');
        const lastUpdatedEl = document.getElementById('lastUpdated');
        
        // Format number
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        // Time ago function
        function timeAgo(timestamp) {
            if (!timestamp) return 'unknown';
            const date = new Date(timestamp);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            
            if (seconds < 60) return 'just now';
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
            return `${Math.floor(seconds / 86400)}d ago`;
        }
        
        // Update Discord stats
        function updateDiscordStats(data) {
            if (data) {
                serverNameEl.textContent = data.name || 'ALPHA COMMUNITY';
                onlineCountEl.textContent = formatNumber(data.presence_count || 0);
                totalMembersEl.textContent = formatNumber(data.members ? data.members.length : 0);
                
                // Count voice channels
                if (data.channels) {
                    const voiceChannels = data.channels.filter(ch => 
                        ch.type === 2 // Voice channel type
                    ).length;
                    voiceChannelsEl.textContent = voiceChannels;
                }
                
                lastUpdatedEl.textContent = 'just now';
            }
        }
        
        // Try to load from GitHub Actions JSON first
        async function loadStats() {
            try {
                // Try to load from GitHub Actions generated JSON
                const response = await fetch(STATS_FILE + '?t=' + Date.now());
                if (response.ok) {
                    const data = await response.json();
                    updateDiscordStats({
                        name: data.server_name,
                        presence_count: data.online_count,
                        members: Array(data.online_count || 0).fill({}),
                        channels: Array(data.voice_count || 0).fill({type: 2})
                    });
                    if (data.last_updated) {
                        lastUpdatedEl.textContent = timeAgo(data.last_updated);
                    }
                    return;
                }
            } catch (error) {
                console.log('Using direct Discord API');
            }
            
            // Fallback to direct Discord API
            fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`)
                .then(res => res.json())
                .then(data => {
                    updateDiscordStats(data);
                    if (data.instant_invite) {
                        document.querySelector('.join-btn').href = data.instant_invite;
                    }
                })
                .catch(() => {
                    serverNameEl.textContent = "ALPHA COMMUNITY";
                    onlineCountEl.textContent = "250+";
                    totalMembersEl.textContent = "1,000+";
                    voiceChannelsEl.textContent = "8";
                });
        }
        
        // Mobile menu toggle
        document.querySelector('.nav-mobile-toggle').addEventListener('click', function() {
            document.querySelector('.nav-links').classList.toggle('active');
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    document.querySelector('.nav-links').classList.remove('active');
                }
            });
        });
        
        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        const SERVERS_FILE = 'src/data/servers.json';

        function buildServerCard(server) {
            const statusClass = server.offline ? 'idle' : 'online';
            return `
                <div class="server-card">
                    <div class="server-status ${statusClass}"></div>
                    <div class="server-icon">
                        <i class="${server.icon}"></i>
                    </div>
                    <h3>${server.name}</h3>
                    <p>${server.description}</p>
                    <div class="server-info">
                        <span><i class="fas fa-user"></i>IP ${server.ip} PORT ${server.port}</span>
                        <span><i class="fas fa-map"></i>${server.type}</span>
                    </div>
                </div>
            `;
        }

        async function loadServers() {
            const serversGrid = document.getElementById('serversGrid');
            if (!serversGrid) return;

            try {
                const response = await fetch(SERVERS_FILE + '?t=' + Date.now());
                if (!response.ok) return;
                const data = await response.json();
                serversGrid.innerHTML = (data.servers || []).map(buildServerCard).join('');
            } catch (error) {
                console.error('Failed to load servers data', error);
            }
        }

        const STAFF_FILE = 'src/data/staff.json';

        function buildStaffRoleCard(role) {
            const members = role.members || [];
            return `
                <article class="staff-role-card">
                    <div class="staff-role-header">
                        <h3>${role.role}</h3>
                        <span>${members.length} Members</span>
                    </div>
                    <div class="staff-role-members">
                        ${members.map(member => `
                            <div class="staff-member">
                                <img src="${member.profileImage}" alt="${member.name}" />
                                <div>
                                    <h4>${member.name}</h4>
                                    <p>${member.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </article>
            `;
        }

        async function loadStaff() {
            const staffGrid = document.getElementById('staffGrid');
            if (!staffGrid) return;

            try {
                const response = await fetch(STAFF_FILE + '?t=' + Date.now());
                if (!response.ok) return;
                const data = await response.json();
                staffGrid.innerHTML = (data.roles || [])
                    .map(role => buildStaffRoleCard(role))
                    .join('');
            } catch (error) {
                console.error('Failed to load staff data', error);
            }
        }

        // Auto-refresh stats every 60 seconds
        function autoRefresh() {
            setInterval(loadStats, 60000);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            autoRefresh();
            loadServers();
            loadStaff();
            
            // Update time every minute
            setInterval(() => {
                const currentText = lastUpdatedEl.textContent;
                if (currentText.includes('m ago') || currentText.includes('h ago')) {
                    lastUpdatedEl.textContent = timeAgo(new Date(Date.now() - 60000));
                }
            }, 60000);
        });



        const TOURNAMENTS_FILE = 'src/data/tournaments.json';
        const tournamentMap = new Map();

        function buildTeamsHtml(teams = []) {
            return `
                <div class="teams-content">
                    ${teams.map(team => `
                        <div class="team-card">
                            <div class="team-name">${team.name}</div>
                            ${team.players.map(player => `
                                <div class="team-player">
                                    <span class="player-main">${player}</span>
                                    <span>Main</span>
                                </div>
                            `).join('')}
                            ${team.sub ? `
                                <div class="team-player">
                                    <span class="player-sub">${team.sub}</span>
                                    <span>Substitute</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function buildDetailsHtml(details = {}, tournament = {}) {
            const formatSection = details.format ? `
                <h4>Tournament Format</h4>
                <ul>
                    ${details.format.map(item => `<li>${item}</li>`).join('')}
                </ul>
            ` : '';

            const rewards = details.rewards ? `
                <h4>Tournament Rewards</h4>
                <div class="rewards-grid">
                    ${details.rewards.first ? `
                        <div class="reward-card gold">
                            <div class="reward-medal">🥇</div>
                            <h5>First Place</h5>
                            <ul>
                                ${details.rewards.first.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${details.rewards.second ? `
                        <div class="reward-card silver">
                            <div class="reward-medal">🥈</div>
                            <h5>Second Place</h5>
                            <ul>
                                ${details.rewards.second.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${details.rewards.third ? `
                        <div class="reward-card bronze">
                            <div class="reward-medal">🥉</div>
                            <h5>Third Place</h5>
                            <ul>
                                ${details.rewards.third.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            ` : '';

            const notesSection = details.notes ? `
                <h4>Important Notes</h4>
                <ul>
                    ${details.notes.map(item => `<li>${item}</li>`).join('')}
                </ul>
            ` : '';

            const highlightsSection = details.highlights ? `
                <h4>Tournament Highlights</h4>
                <ul>
                    ${details.highlights.map(item => `<li>${item}</li>`).join('')}
                </ul>
            ` : '';

            const winnersSection = tournament.winners ? `
                <h4>Winners</h4>
                <ul>
                    ${tournament.winners.map(winner => `<li>${winner}</li>`).join('')}
                </ul>
            ` : '';

            const finalMatch = tournament.bracket && tournament.bracket.length
                ? tournament.bracket[tournament.bracket.length - 1].matches?.[0]
                : null;
            const finalMatchSection = finalMatch ? `
                <h4>Final Match</h4>
                <p>${finalMatch}</p>
            ` : '';

            return `
                <div class="details-content">
                    ${formatSection}
                    ${rewards}
                    ${notesSection}
                    ${highlightsSection}
                    ${winnersSection}
                    ${finalMatchSection}
                </div>
            `;
        }

        function buildBracketHtml(bracket = []) {
            return `
                <div class="bracket-content">
                    ${bracket.map(round => `
                        <div class="bracket-round">
                            <h5>${round.title}</h5>
                            ${round.matches.map(match => `
                                <div class="match">
                                    <div class="match-teams">${match}</div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function buildTournamentCard(tournament, badgeLabel, badgeIcon) {
            const actions = `
                <div class="tournament-actions">
                    <button class="tournament-btn details-btn" onclick="showPopup('${tournament.id}', 'details')">
                        <i class="fas fa-info-circle"></i> Tournament Details
                    </button>
                    <button class="tournament-btn teams-btn" onclick="showPopup('${tournament.id}', 'teams')">
                        <i class="fas fa-users"></i> View Teams
                    </button>
                    <button class="tournament-btn bracket-btn" onclick="showPopup('${tournament.id}', 'bracket')">
                        <i class="fas fa-sitemap"></i> View Bracket
                    </button>
                    ${tournament.registrationOpen ? `
                        <a class="tournament-btn register-btn" href="${tournament.registrationLink}" target="_blank" rel="noopener">
                            <i class="fas fa-link"></i> Register
                        </a>
                    ` : ''}
                    ${tournament.registrationOpen === false ? `
                        <span class="tournament-status">
                            <i class="fas fa-info-circle"></i> ${tournament.registrationStatusText || 'Registrations are not closed'}
                        </span>
                    ` : ''}
                </div>
            `;

            const winners = tournament.winners ? `
                <div class="tournament-winners">
                    <h4>Winners</h4>
                    <ul>
                        ${tournament.winners.map(winner => `<li>${winner}</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            return `
                <div class="tournament-card">
                    <div class="tournament-badge">
                        <i class="${badgeIcon}"></i> ${badgeLabel}
                    </div>
                    <div class="tournament-header">
                        <h3>${tournament.title}</h3>
                        <p class="tournament-quote">${tournament.quote}</p>
                    </div>
                    <div class="tournament-details">
                        <div class="detail-row">
                            <div class="detail-item">
                                <i class="far fa-calendar"></i>
                                <div>
                                    <strong>Date</strong>
                                    <p>${tournament.date}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-users"></i>
                                <div>
                                    <strong>Format</strong>
                                    <p>${tournament.format}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-gamepad"></i>
                                <div>
                                    <strong>Game</strong>
                                    <p>${tournament.game}</p>
                                </div>
                            </div>
                        </div>
                        <p class="tournament-description">${tournament.description}</p>
                        ${winners}
                        ${actions}
                    </div>
                </div>
            `;
        }

        function buildArchivedCard(tournament) {
            return `
                <button class="archived-card" type="button" onclick="showPopup('${tournament.id}', 'details')">
                    <div class="archived-card-header">
                        <h4>${tournament.title}</h4>
                        <span class="archived-date">${tournament.date}</span>
                    </div>
                    <div class="archived-card-body">
                        <p>${tournament.format}</p>
                        <p>${tournament.game}</p>
                    </div>
                    <div class="archived-card-action">
                        View Details <i class="fas fa-arrow-right"></i>
                    </div>
                </button>
            `;
        }

        async function loadTournamentData() {
            try {
                const response = await fetch(TOURNAMENTS_FILE + '?t=' + Date.now());
                if (!response.ok) {
                    return;
                }
                const data = await response.json();
                const activeContainer = document.getElementById('activeTournament');
                const archivedList = document.getElementById('archivedList');

                if (archivedList) {
                    archivedList.classList.remove('is-open');
                }

                if (data.activeEnabled === false || !data.active || data.active.length === 0) {
                    activeContainer.innerHTML = `
                        <div class="tournament-empty">
                            No active tournament currently, stay tuned.
                        </div>
                    `;
                } else if (data.active && data.active.length > 0) {
                    data.active.forEach(tournament => tournamentMap.set(tournament.id, tournament));
                    activeContainer.innerHTML = buildTournamentCard(data.active[0], 'ACTIVE TOURNAMENT', 'fas fa-fire');
                }

                if (data.archived && data.archived.length > 0) {
                    archivedList.innerHTML = data.archived.map(tournament => {
                        tournamentMap.set(tournament.id, tournament);
                        return buildArchivedCard(tournament);
                    }).join('');
                }
            } catch (error) {
                console.error('Failed to load tournament data', error);
            }
        }

        // Popup Functions
        function showPopup(tournamentId, type) {
            const popupOverlay = document.getElementById('popupOverlay');
            const popupTitle = document.getElementById('popupTitle');
            const popupContent = document.getElementById('popupContent');
            const tournament = tournamentMap.get(tournamentId);

            if (!tournament) {
                return;
            }
            
            // Set title based on type
            const titles = {
                details: 'Tournament Details',
                teams: 'Registered Teams',
                bracket: 'Tournament Bracket'
            };
            
            popupTitle.textContent = titles[type];
            if (type === 'details') {
                popupContent.innerHTML = buildDetailsHtml(tournament.details, tournament);
            } else if (type === 'teams') {
                popupContent.innerHTML = buildTeamsHtml(tournament.registeredTeams);
            } else if (type === 'bracket') {
                popupContent.innerHTML = buildBracketHtml(tournament.bracket);
            }
            
            // Show popup
            popupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closePopup() {
            const popupOverlay = document.getElementById('popupOverlay');
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Close popup when clicking outside content
        document.getElementById('popupOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup();
            }
        });

        // Close popup with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePopup();
            }
        });

        // Initialize tournament section
        document.addEventListener('DOMContentLoaded', function() {
            // Add the popup HTML if not already added
            if (!document.getElementById('popupOverlay')) {
                const popupHTML = `
                    <div class="popup-overlay" id="popupOverlay">
                        <div class="popup-container">
                            <div class="popup-header">
                                <h3 id="popupTitle"></h3>
                                <button class="popup-close" onclick="closePopup()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="popup-content" id="popupContent"></div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', popupHTML);
            }

            const archivedToggle = document.getElementById('archivedToggle');
            const archivedList = document.getElementById('archivedList');

            if (archivedToggle && archivedList) {
                archivedToggle.addEventListener('click', () => {
                    const isOpen = archivedList.classList.toggle('is-open');
                    archivedToggle.setAttribute('aria-expanded', String(isOpen));
                });
            }

            loadTournamentData();
        });

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
        
        // Auto-refresh stats every 60 seconds
        function autoRefresh() {
            setInterval(loadStats, 60000);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            autoRefresh();
            
            // Update time every minute
            setInterval(() => {
                const currentText = lastUpdatedEl.textContent;
                if (currentText.includes('m ago') || currentText.includes('h ago')) {
                    lastUpdatedEl.textContent = timeAgo(new Date(Date.now() - 60000));
                }
            }, 60000);
        });



        // Tournament Data
        const tournamentData = {
            details: `
                <div class="details-content">
                    <h4>Tournament Format</h4>
                    <ul>
                        <li>All matches will be in epic mode</li>
                        <li>All matches will be in trio mode (3v3)</li>
                        <li>All matches will be with gloves</li>
                        <li>All matches will be a single series, best of 3 soccer rounds</li>
                        <li>All matches will be live streamed in Alpha Community</li>
                    </ul>
                    
                    <h4>Tournament Rewards</h4>
                    <div class="rewards-grid">
                        <div class="reward-card gold">
                            <div class="reward-medal">🥇</div>
                            <h5>First Place</h5>
                            <ul>
                                <li>「🜲・𝕊𝕆ℂℂ𝔼ℝ 𝔾𝕆𝔸𝕋𝕊」display role</li>
                                <li>Adminship for 90 days</li>
                                <li>Custom effect and tag in any Alpha server</li>
                                <li>1 million owo / INR 100 each</li>
                            </ul>
                        </div>
                        
                        <div class="reward-card silver">
                            <div class="reward-medal">🥈</div>
                            <h5>Second Place</h5>
                            <ul>
                                <li>VIP status for 90 days</li>
                                <li>Custom effect and tag in any Alpha server</li>
                                <li>500k OwO each</li>
                            </ul>
                        </div>
                        
                        <div class="reward-card bronze">
                            <div class="reward-medal">🥉</div>
                            <h5>Third Place</h5>
                            <ul>
                                <li>Custom tag in any Alpha server for 90 days</li>
                                <li>250k OwO each</li>
                            </ul>
                        </div>
                    </div>
                    
                    <h4>Important Notes</h4>
                    <p>Tournament Date: January 31 - February 1<br>
                    Register your team in our Discord server before the deadline!</p>
                </div>
            `,
            
            teams: `
                <div class="teams-content">
                    ${[
                        {name: 'MAGUS', players: ['Pioosh', 'Yuta', 'Daemon'], sub: 'Oldmaster'},
                        {name: 'AAND KILLERS', players: ['Warmachine', 'Nooboholic', 'Adiismoredumb'], sub: 'Sanchit'},
                        {name: 'DeViL', players: ['Defender', 'Voidpulse', 'Luci']},
                        {name: 'TNT', players: ['THEGODY', 'Tc ..007', 'Thundér']},
                        {name: 'BRD Elite', players: ['𝗥𝔞𝐣ɑ 𝔹ⱥ฿Մ', 'ғʟᴀ֟፝ᴍᴇx࿐', 'ℑ𝔱𝔖_𝔇𝔞𝔎𝔲'], sub: 'Bouncer'},
                        {name: 'ADRENALINE', players: ['Donny(7)', '👽 legend 👽', 'piXel'], sub: 'AB-GAMER'},
                        {name: 'Phantom wolves', players: ['Wolfbleed', 'Winninghu6', 'Orbitalquo'], sub: 'Faction'},
                        {name: 'Dancing dinos', players: ['VIP Rascal', 'Chisiya', 'Kartik'], sub: 'Zaref'},
                        {name: 'Team 9 🗿', players: ['Ekam_07', 'GOJO7', 'Foxey47']},
                        {name: 'Team Pixel', players: ['KINGofCri2', 'Zuhyb', 'Blurry'], sub: 'Normii'},
                        {name: 'Plot Armour', players: ['Alpha', 'Babur', 'Reen']},
                        {name: 'Mini Estupids', players: ['Slashbyte', 'Defiant', 'Ben'], sub: 'Zad'},
                        {name: 'The Morphs', players: ['miltiaapp1', 'L E V I 🦇', 'мσяηιηg ѕтαя']},
                        {name: 'हवसी दरिंदे', players: ['Selbel', 'NerdyOP', 'Addictives']},
                        {name: 'Cyber knights', players: ['DustyAccou', 'Mijwal77', 'Cypher27x'], sub: 'Oddynamic'},
                        {name: 'Gudday biscuits', players: ['Guddu:)', 'Sahilllllll', 'Chimkandi'], sub: 'Nippy'},
                        {name: 'Ping Blamers', players: ['Baddie Hunter', 'IamJustAFish', 'Jal Pradushan']},
                        {name: 'DEADBOTS', players: ['SWAGGER', 'FAKE GUY', 'Pengu ❤️']}
                    ].map(team => `
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
            `,
            
            bracket: `
                <div class="bracket-content">
                    <div class="bracket-container">
                        <div class="bracket-side">
                            <h4>LEFT BRACKET</h4>
                            
                            <div class="bracket-round">
                                <h5>ROUND 1</h5>
                                <div class="match">
                                    <div class="match-teams">[BRD ELITE] vs [TNT]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[TEAM 9] vs [DANCING DINOS]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[ADRENALINE] vs [Guddav Biscuits]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[TEAM PIXEL] vs [DEADBOTS]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match bye-match">
                                    <div class="match-teams">(PLOT ARMOUR - BYE)</div>
                                    <div class="match-info">Automatic advancement</div>
                                </div>
                            </div>
                            
                            <div class="bracket-round">
                                <h5>SEMIFINALS</h5>
                                <div class="match">
                                    <div class="match-teams">Winner 1 vs Winner 2</div>
                                    <div class="match-info">TBD</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">Winner 3 vs Winner 4</div>
                                    <div class="match-info">TBD</div>
                                </div>
                            </div>
                            
                            <div class="bracket-round">
                                <h5>LEFT FINAL</h5>
                                <div class="match final-match">
                                    <div class="match-teams">Semi 1 Winner vs Semi 2 Winner</div>
                                    <div class="match-info">Qualifies to Grand Final</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bracket-side">
                            <h4>RIGHT BRACKET</h4>
                            
                            <div class="bracket-round">
                                <h5>ROUND 1</h5>
                                <div class="match">
                                    <div class="match-teams">[MINI ESTUPIDS] vs [AAND KILLERS]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[Cyber Knights] vs [Devil]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[THE MORPHS] vs [MAGUS]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">[हिंदी दस्ते] vs [PHANTOM WOLVES]</div>
                                    <div class="match-info">Best of 3 | Epic Soccer</div>
                                </div>
                                <div class="match bye-match">
                                    <div class="match-teams">(PING BLAMERS - BYE)</div>
                                    <div class="match-info">Automatic advancement</div>
                                </div>
                            </div>
                            
                            <div class="bracket-round">
                                <h5>SEMIFINALS</h5>
                                <div class="match">
                                    <div class="match-teams">Winner 1 vs Winner 2</div>
                                    <div class="match-info">TBD</div>
                                </div>
                                <div class="match">
                                    <div class="match-teams">Winner 3 vs Winner 4</div>
                                    <div class="match-info">TBD</div>
                                </div>
                            </div>
                            
                            <div class="bracket-round">
                                <h5>RIGHT FINAL</h5>
                                <div class="match final-match">
                                    <div class="match-teams">Semi 1 Winner vs Semi 2 Winner</div>
                                    <div class="match-info">Qualifies to Grand Final</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bracket-round" style="text-align: center; margin-top: 40px;">
                        <h5>GRAND FINAL</h5>
                        <div class="match final-match" style="max-width: 400px; margin: 0 auto;">
                            <div class="match-teams">Left Final Winner vs Right Final Winner</div>
                            <div class="match-info">CHAMPIONSHIP MATCH</div>
                            <div class="match-status">TO BE DETERMINED</div>
                        </div>
                    </div>
                </div>
            `
        };

        // Popup Functions
        function showPopup(type) {
            const popupOverlay = document.getElementById('popupOverlay');
            const popupTitle = document.getElementById('popupTitle');
            const popupContent = document.getElementById('popupContent');
            
            // Set title based on type
            const titles = {
                details: 'Tournament Details',
                teams: 'Registered Teams',
                bracket: 'Tournament Bracket'
            };
            
            popupTitle.textContent = titles[type];
            popupContent.innerHTML = tournamentData[type];
            
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
        });


// Server Data Configuration
const serverConfigs = {
    'Alpha Epic Teams': {
        jsonPath: 'src/servers/alpha-epic-teams.json',
        ip: '34.47.155.240',
        port: '42343'
    },
    'Alpha Epic Soccer': {
        jsonPath: 'src/servers/alpha-epic-soccer.json',
        ip: '152.67.11.35',
        port: '43210'
    },
    'Alpha Epic Duels': {
        jsonPath: 'src/servers/alpha-epic-duels.json',
        ip: '13.127.82.216',
        port: '43210'
    },
    'Alpha vs Defender Pro Soccer': {
        jsonPath: 'src/servers/alpha-defender-pro-soccer.json',
        ip: '13.204.68.220',
        port: '43243'
    },
    'Alpha vs PDF FFA': {
        jsonPath: 'src/servers/alpha-pdf-ffa.json',
        ip: '13.232.55.163',
        port: '43210'
    },
    'Alpha vs Nooboholic Fantasy Soccer': {
        jsonPath: 'src/servers/alpha-nooboholic-fantasy.json',
        ip: '129.151.46.134',
        port: '43243'
    }
};

// Current server data
let currentServerData = null;
let currentServerName = '';

// Server Popup Functions
function showServerPopup(serverName) {
    currentServerName = serverName;
    const serverConfig = serverConfigs[serverName];
    
    if (!serverConfig) {
        alert('Server configuration not found!');
        return;
    }
    
    // Update popup title
    document.getElementById('serverPopupTitle').textContent = serverName;
    
    // Show popup
    document.getElementById('serverPopupOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load server data
    loadServerData(serverConfig.jsonPath, serverConfig.ip, serverConfig.port);
    
    // Set up copy button
    const copyBtn = document.getElementById('copyIpBtn');
    copyBtn.onclick = function() {
        copyToClipboard(`${serverConfig.ip}:${serverConfig.port}`);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy IP:PORT';
        }, 2000);
    };
}

function closeServerPopup() {
    document.getElementById('serverPopupOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentServerData = null;
}

function refreshServerData() {
    if (currentServerName && serverConfigs[currentServerName]) {
        const serverConfig = serverConfigs[currentServerName];
        loadServerData(serverConfig.jsonPath, serverConfig.ip, serverConfig.port);
        
        // Show refreshing indicator
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
    }
}

async function loadServerData(jsonPath, ip, port) {
    try {
        // Add timestamp to prevent caching
        const response = await fetch(`${jsonPath}?t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentServerData = data;
        
        // Update UI with server data
        updateServerUI(data);
        
        // Reset refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        refreshBtn.disabled = false;
        
    } catch (error) {
        console.error('Error loading server data:', error);
        showServerError();
    }
}

function updateServerUI(data) {
    // Update status
    const status = data.status || 'offline';
    const statusIndicator = document.getElementById('serverStatus');
    const statusText = document.getElementById('serverStatusText');
    
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Update last updated time
    const lastUpdated = document.getElementById('serverLastUpdated');
    if (data.last_updated) {
        const timeAgo = getTimeAgo(data.last_updated);
        lastUpdated.textContent = `Last updated: ${timeAgo}`;
    }
    
    // Update server info - filter out host from total players
    if (data.server_info) {
        const realPlayers = data.players ? data.players.filter(p => p.client_id !== -1).length : 0;
        
        document.getElementById('currentRound').textContent = data.server_info.current_round || 'Unknown';
        document.getElementById('nextRound').textContent = data.server_info.next_round || 'Unknown';
        document.getElementById('totalPlayers').textContent = realPlayers; // Show real players count
        document.getElementById('liveChat').textContent = data.server_info.live_chat_enabled ? 'Enabled' : 'Disabled';
    }
    
    // Update statistics - filter out host
    if (data.statistics) {
        const realPlayers = data.players ? data.players.filter(p => p.client_id !== -1) : [];
        const inGame = realPlayers.filter(p => !p.is_in_lobby).length;
        const inLobby = realPlayers.filter(p => p.is_in_lobby).length;
        
        document.getElementById('inGame').textContent = inGame;
        document.getElementById('inLobby').textContent = inLobby;
    }
    
    // Update players (will filter out host)
    updatePlayersList(data.players || []);
}

function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    const playersCount = document.getElementById('playersCount');
    
    // Filter out players with client_id = -1 (host/server bot)
    const realPlayers = players.filter(player => player.client_id !== -1);
    
    // Update count with real players only
    playersCount.textContent = realPlayers.length;
    
    if (realPlayers.length === 0) {
        playersList.innerHTML = `
            <div class="no-players">
                <i class="fas fa-user-slash"></i>
                <p>No players online</p>
            </div>
        `;
        return;
    }
    
    // Create player cards for real players only
    playersList.innerHTML = realPlayers.map(player => `
        <div class="player-card">
            <div class="player-header">
                <div class="player-name">${escapeHtml(player.display_name || player.name || 'Unknown')}</div>
                <div class="player-id">${player.id ? player.id.substring(0, 8) + '...' : 'N/A'}</div>
            </div>
            <div class="player-details">
                <div class="player-detail">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${escapeHtml(player.name || 'Unknown')}</span>
                </div>
                <div class="player-detail">
                    <span class="detail-label">v2 Device ID:</span>
                    <span class="detail-value device-id">${escapeHtml(player.device_id || 'Unknown')}</span>
                </div>
                <div class="player-detail">
                    <span class="detail-label">Client ID:</span>
                    <span class="detail-value">${player.client_id || 'N/A'}</span>
                </div>
                <div class="player-detail">
                    <span class="detail-label">Play Time:</span>
                    <span class="detail-value">${player.play_time_minutes || 0} min</span>
                </div>
                <div class="player-detail">
                    <span class="detail-label">In Lobby:</span>
                    <span class="detail-value">${player.is_in_lobby ? 'Yes' : 'No'}</span>
                </div>
                <div class="player-detail">
                    <span class="detail-label">Joined:</span>
                    <span class="detail-value">${player.join_time ? getTimeAgo(new Date(player.join_time * 1000).toISOString()) : 'Unknown'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showServerError() {
    const statusIndicator = document.getElementById('serverStatus');
    const statusText = document.getElementById('serverStatusText');
    const lastUpdated = document.getElementById('serverLastUpdated');
    
    statusIndicator.className = 'status-indicator offline';
    statusText.textContent = 'Error';
    lastUpdated.textContent = 'Failed to load data';
    
    document.getElementById('playersList').innerHTML = `
        <div class="no-players">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load player data</p>
            <p style="font-size: 0.8rem; margin-top: 10px;">Please try refreshing</p>
        </div>
    `;
}

// Utility Functions
function getTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Initialize server cards
function initializeServerCards() {
    const serverCards = document.querySelectorAll('.server-card');
    
    serverCards.forEach(card => {
        const serverName = card.querySelector('h3').textContent;
        
        // Make card clickable
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            showServerPopup(serverName);
        });
        
        // Add click effect
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('mouseup', () => {
            card.style.transform = '';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Close server popup when clicking outside or pressing Escape
document.getElementById('serverPopupOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeServerPopup();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('serverPopupOverlay').classList.contains('active')) {
        closeServerPopup();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add server popup HTML if not already added
    if (!document.getElementById('serverPopupOverlay')) {
        const serverPopupHTML = `
            <div class="server-popup-overlay" id="serverPopupOverlay">
                <div class="server-popup-container">
                    <div class="server-popup-header">
                        <h3 id="serverPopupTitle">Server Details</h3>
                        <button class="server-popup-close" onclick="closeServerPopup()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="server-popup-content">
                        <!-- Content will be loaded dynamically -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', serverPopupHTML);
    }
    
    // Initialize server cards
    initializeServerCards();
});

document.addEventListener("DOMContentLoaded", () => {
    initializeServerCards();
});
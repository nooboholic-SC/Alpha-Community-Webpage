import requests
import json
import os
from datetime import datetime
import sys

def fetch_discord_widget(server_id):
    """Fetch Discord server widget data (public API)"""
    url = f"https://discord.com/api/guilds/{server_id}/widget.json"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract data from widget
            stats = {
                'server_name': data.get('name', 'Unknown Server'),
                'server_id': server_id,
                'online_count': len(data.get('members', [])),
                'voice_count': len(data.get('channels', [])),
                'invite_url': data.get('instant_invite', ''),
                'last_updated': datetime.utcnow().isoformat() + 'Z',
                'source': 'discord_widget'
            }
            
            # Try to get approximate total members (widget doesn't provide this directly)
            # We'll estimate based on online percentage
            stats['estimated_total'] = estimate_total_members(stats['online_count'])
            
            print(f"Successfully fetched widget data: {stats['online_count']} online")
            return stats
            
        else:
            print(f"❌ Widget API error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error fetching widget: {e}")
        return None

def estimate_total_members(online_count):
    """Estimate total members based on typical online percentage"""
    # Typical Discord server has 20-30% online at peak times
    # This is just an estimate - adjust based on your server
    if online_count == 0:
        return 100  # Default minimum
    
    # Conservative estimate: assume 25% online
    estimated_total = online_count * 4
    
    # Add some randomness for demo purposes (remove in production)
    import random
    variation = random.randint(-10, 10) / 100  # ±10%
    estimated_total = int(estimated_total * (1 + variation))
    
    # Ensure minimum
    return max(online_count + 10, estimated_total)

def load_previous_stats():
    """Load previous statistics from file"""
    try:
        with open('discord-stats.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def calculate_trend(current, previous):
    """Calculate trend based on previous data"""
    if not previous or 'online_count' not in previous:
        return 'stable'
    
    prev_online = previous.get('online_count', 0)
    
    if current > prev_online:
        return 'up'
    elif current < prev_online:
        return 'down'
    else:
        return 'stable'

def main():
    server_id = os.getenv('SERVER_ID')
    
    if not server_id:
        print("SERVER_ID not set. Using demo data.")
        # Create demo data for testing
        stats = {
            'server_name': 'Demo Discord Server',
            'server_id': 'demo123',
            'online_count': 247,
            'estimated_total': 1250,
            'voice_count': 5,
            'invite_url': 'https://discord.gg/demo',
            'last_updated': datetime.utcnow().isoformat() + 'Z',
            'source': 'demo_data',
            'note': 'Set SERVER_ID secret for real Discord widget data'
        }
    else:
        stats = fetch_discord_widget(server_id)
        
        if not stats:
            # Fallback to previous data or demo
            previous = load_previous_stats()
            if previous and 'source' in previous and previous['source'] != 'demo_data':
                print("Using previous data due to widget fetch failure")
                previous['last_updated'] = datetime.utcnow().isoformat() + 'Z'
                previous['fetch_error'] = True
                stats = previous
            else:
                # Create demo fallback
                stats = {
                    'server_name': 'My Discord Server',
                    'server_id': server_id,
                    'online_count': 150,
                    'estimated_total': 750,
                    'voice_count': 3,
                    'last_updated': datetime.utcnow().isoformat() + 'Z',
                    'source': 'fallback_data',
                    'note': 'Enable server widget in Discord settings for live data'
                }
    
    # Load previous stats for trend calculation
    previous_stats = load_previous_stats()
    
    # Add trend information
    if 'online_count' in stats and previous_stats:
        stats['trend'] = calculate_trend(stats['online_count'], previous_stats)
    
    # Add update history
    if 'update_history' in previous_stats:
        stats['update_history'] = previous_stats['update_history'][-9:] + [{
            'timestamp': stats['last_updated'],
            'online': stats['online_count']
        }]
    else:
        stats['update_history'] = [{
            'timestamp': stats['last_updated'],
            'online': stats['online_count']
        }]
    
    # Add uptime information
    stats['uptime_percentage'] = "99.8%"  # Example value
    stats['peak_hour'] = "19:00 UTC"  # Example value
    
    # Save to file
    with open('discord-stats.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f"Stats saved to discord-stats.json")
    print(f"Online: {stats['online_count']}")
    print(f"Estimated Total: {stats.get('estimated_total', 'N/A')}")

if __name__ == '__main__':
    main()

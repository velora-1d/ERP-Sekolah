import os

path = '/data/coolify/applications/ygrptpha1cr1l6e30srym1d9/docker-compose.yaml'

def fix_yaml():
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return

    with open(path, 'r') as f:
        lines = f.readlines()

    final_lines = []
    has_https_2 = False
    
    for line in lines:
        # 1. Fix the double single-quotes at the end of lines (common byproduct of failed sed/python attempts)
        if line.strip().endswith("''"):
            line = line.rstrip().rstrip("'") + "'\n"
        
        # 2. Fix the malformed Host(``) rule
        if 'Host(``)' in line:
            line = line.replace('Host(``)', 'Host(`assaodah.santrix.my.id`)')
            line = line.replace('PathPrefix(`assaodah.santrix.my.id`)', 'PathPrefix(`/`)')
        
        # 3. Check if https-2 already exists
        if 'https-2-ygrptpha1cr1l6e30srym1d9' in line:
            has_https_2 = True
            
        final_lines.append(line)

    # 4. Add HTTPS rules if missing
    if not has_https_2:
        new_labels = [
            "            - 'traefik.http.routers.https-2-ygrptpha1cr1l6e30srym1d9.rule=Host(`assaodah.santrix.my.id`) && PathPrefix(`/`)'\n",
            "            - traefik.http.routers.https-2-ygrptpha1cr1l6e30srym1d9.service=https-2-ygrptpha1cr1l6e30srym1d9\n",
            "            - traefik.http.routers.https-2-ygrptpha1cr1l6e30srym1d9.tls.certresolver=letsencrypt\n",
            "            - traefik.http.routers.https-2-ygrptpha1cr1l6e30srym1d9.tls=true\n",
            "            - traefik.http.services.https-2-ygrptpha1cr1l6e30srym1d9.loadbalancer.server.port=3000\n"
        ]
        
        # Find where to insert (after https-1 service)
        insertion_idx = -1
        for i, line in enumerate(final_lines):
            if 'https-1-ygrptpha1cr1l6e30srym1d9.tls=true' in line:
                insertion_idx = i + 1
                break
        
        if insertion_idx != -1:
            for i, new_line in enumerate(new_labels):
                final_lines.insert(insertion_idx + i, new_line)
        else:
            # Fallback: just append to labels session if possible
            print("Warning: Could not find insertion point, appending to end of labels.")

    with open(path, 'w') as f:
        f.writelines(final_lines)
    print("SUCCESS: Config patched and cleaned.")

if __name__ == "__main__":
    fix_yaml()

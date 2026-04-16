import sys
path = '/data/coolify/applications/ygrptpha1cr1l6e30srym1d9/docker-compose.yaml'
try:
    with open(path, 'r') as f:
        content = f.read()
    # Fix HTTP rule for assaodah
    # Note: Using backticks inside the strings
    bad_rule = 'Host(``) && PathPrefix(`assaodah.santrix.my.id`)'
    good_rule = 'Host(`assaodah.santrix.my.id`) && PathPrefix(`/`)'
    if bad_rule in content:
        content = content.replace(bad_rule, good_rule)
    else:
        print("Warning: bad_rule not found, maybe already patched or different format.")
    
    # Ensure HTTPS exists for assaodah
    if 'https-2' not in content:
        old_line = "traefik.http.routers.https-1-ygrptpha1cr1l6e30srym1d9.rule=Host(`erp-sekolah.santrix.my.id`) && PathPrefix(`/`)"
        new_line = "traefik.http.routers.https-2-ygrptpha1cr1l6e30srym1d9.rule=Host(`assaodah.santrix.my.id`) && PathPrefix(`/`)"
        if old_line in content:
            content = content.replace(old_line, old_line + "\n            - '" + new_line + "'")
            print("Successfully added https-2 router")

    with open(path, 'w') as f:
        f.write(content)
    print("SUCCESS: File patched")
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)

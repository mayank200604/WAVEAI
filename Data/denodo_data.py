import requests
import pandas as pd

#  Registry of Denodo view URLs
DENODO_VIEWS = {
    "cricket": "http://localhost:9090/server/admin/cricket_1/views/cricket_1",
    "financial": "http://localhost:9090/server/admin/financial/views/financial",
    "gk_questions": "http://localhost:9090/server/admin/gk_questions/views/gk_questions",
    "health": "http://localhost:9090/server/admin/health/views/health",
    "movies": "http://localhost:9090/server/admin/movies/views/movies",
    "tech": "http://localhost:9090/server/admin/tech/views/tech",
    "esg_data": "http://localhost:9090/server/admin/digital_innovance"
}

#  Denodo credentials
USERNAME = "admin"
PASSWORD = "admin"  

#  Generic fetch function
def fetch_denodo_view(view_name, url, as_dataframe=False):
    headers = {"Accept": "application/json"}
    try:
        response = requests.get(url, auth=(USERNAME, PASSWORD), headers=headers)
        response.raise_for_status()
        data = response.json()
        if as_dataframe:
            return pd.DataFrame(data)
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP error for '{view_name}': {http_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"❌ Request error for '{view_name}': {req_err}")
    except ValueError:
        print(f"❌ Failed to parse JSON for '{view_name}'")
    return None

#  Fetch all views
if __name__ == "__main__":
    all_data = {}
    for view_name, url in DENODO_VIEWS.items():
        print(f"\n🔄 Fetching '{view_name}'...")
        data = fetch_denodo_view(view_name, url, as_dataframe=False)
        if data:
            print(f"✅ Retrieved {len(data)} records from '{view_name}'")
            all_data[view_name] = data
        else:
            print(f"⚠️ No data returned from '{view_name}'")

   
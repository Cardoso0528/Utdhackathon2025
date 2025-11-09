"""
Scrape AT&T outage metadata from istheservicedown.com using cloudscraper.
Bypasses Cloudflare automatically, then parses with BeautifulSoup.
"""

import re
import json
from datetime import datetime
from bs4 import BeautifulSoup
import cloudscraper


# ---------------------------------------------------------------------------
#  Helpers

def text(el):
    return el.get_text(strip=True) if el else ""

def attr(el, name):
    return el.get(name) if el and el.has_attr(name) else None

def parse_datetime(raw):
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).isoformat()
    except Exception:
        return raw


# ---------------------------------------------------------------------------
#  Parsers

def parse_head_meta(soup):
    head = {}
    head["title"] = text(soup.find("title"))
    head["canonical"] = attr(soup.find("link", rel="canonical"), "href")

    for name in ["description", "generated", "robots", "theme-color", "msapplication-TileColor"]:
        tag = soup.find("meta", attrs={"name": name})
        if tag:
            head[name] = attr(tag, "content")

    # Open Graph
    og = {}
    for prop in ["og:site_name", "og:type", "og:title", "og:description", "og:image", "og:url"]:
        tag = soup.find("meta", property=prop)
        if tag:
            og[prop.split(":")[1]] = attr(tag, "content")
    if og:
        head["open_graph"] = og

    # Twitter
    tw = {}
    for name in [
        "twitter:site", "twitter:site:id", "twitter:card", "twitter:creator",
        "twitter:title", "twitter:description", "twitter:image", "twitter:domain"
    ]:
        tag = soup.find("meta", attrs={"name": name})
        if tag:
            tw[name.split(":")[1]] = attr(tag, "content")
    if tw:
        head["twitter"] = tw

    return head


def parse_json_ld(soup):
    graphs = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string)
        except Exception:
            continue
        if isinstance(data, dict) and "@graph" in data:
            graphs.extend(data["@graph"])
        else:
            graphs.append(data)

    result = {"graphs": graphs}
    for key in ["Article", "WebPage", "ImageObject", "BreadcrumbList"]:
        node = next((g for g in graphs if isinstance(g, dict) and g.get("@type") == key), None)
        if node:
            result[key.lower()] = node
    return result


def parse_service_header(soup):
    return {
        "title_h1": text(soup.select_one("main article header h1")),
        "subtitle_h2": text(soup.select_one("main article header h2")),
        "logo": attr(soup.select_one(".service-logo-container img"), "src"),
    }


def parse_service_status(soup):
    box = soup.select_one(".service-status-alert-box")
    if not box:
        return {}

    return {
        "status_class": " ".join(box.get("class", [])),
        "title": text(box.select_one(".status-title-normal, .status-title-major, .status-title-some")),
        "summary": text(box.select_one(".status-summary")),
    }


def parse_chart(soup):
    chart = {}
    for script in soup.find_all("script"):
        if script.string and "var chartTs" in script.string:
            match = re.search(r"var\s+chartTs\s*=\s*(\d+)", script.string)
            if match:
                chart["chart_ts"] = match.group(1)
            break

    img = soup.select_one("#chart-container #chart-img")
    if img:
        chart["image_src"] = attr(img, "src")
        chart["image_alt"] = attr(img, "alt")
        alt = attr(img, "alt") or ""
        m = re.search(r"(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2})", alt)
        if m:
            chart["alt_time"] = m.group(1)
    return chart


def parse_most_reported(soup):
    problems = []
    for li in soup.select("ol.doughtnut-list > li"):
        label = text(li.select_one("p"))
        percent_text = text(li.select_one("p span")) or attr(li.select_one("img"), "alt") or ""
        m = re.search(r"(\d+)%", percent_text)
        percent = int(m.group(1)) if m else None
        label = re.sub(r"\(\d+%\)", "", label).strip()
        problems.append({"label": label, "percent": percent})
    return problems


def parse_live_outage_cities(soup):
    cities = []
    header = next((h for h in soup.find_all("h3") if "Live Outage Map" in text(h)), None)
    para = header.find_next("p") if header else None
    if not para:
        return cities
    for a in para.find_all("a"):
        cities.append({"city": text(a), "href": attr(a, "href")})
    return cities


def parse_latest_reports(soup):
    reports = []
    for tr in soup.select("#latestreports tr"):
        cells = tr.find_all("td")
        if len(cells) != 3:
            continue
        time_el = cells[2].find("time")
        reports.append({
            "city": text(cells[0]),
            "reason": text(cells[1]),
            "time_human": text(cells[2]),
            "time_iso": parse_datetime(attr(time_el, "datetime")),
        })
    return reports


def parse_issue_feed(soup):
    issues = []
    for li in soup.select("ul.reports > li"):
        user = text(li.select_one("span.pseudolink"))
        body = text(li.select_one("p span"))
        time_el = li.select_one("time")
        time_iso = parse_datetime(attr(time_el, "datetime"))
        loc_el = li.select_one("a.city-link")
        issues.append({
            "user": user,
            "text": body,
            "time_iso": time_iso,
            "location": text(loc_el) if loc_el else None,
        })
    return issues


# ---------------------------------------------------------------------------
#  Main

def parse_outage_page(html):
    soup = BeautifulSoup(html, "html.parser")
    return {
        # "head_meta": parse_head_meta(soup),
        # "json_ld": parse_json_ld(soup),
        # "service_header": parse_service_header(soup),
        # "service_status": parse_service_status(soup),
        "chart": parse_chart(soup),
        "most_reported_problems": parse_most_reported(soup),
        "live_outage_cities": parse_live_outage_cities(soup),
        "latest_reports": parse_latest_reports(soup),
        "issues_reports": parse_issue_feed(soup),
    }


# ---------------------------------------------------------------------------
#  Fetch and run

if __name__ == "__main__":
    url = "https://istheservicedown.com/problems/att"

    # cloudscraper automatically handles Cloudflare
    scraper = cloudscraper.create_scraper(browser={"browser": "chrome", "platform": "windows", "desktop": True})
    html = scraper.get(url, timeout=30).text

    data = parse_outage_page(html)

    import pprint
    pprint.pprint(data)

prompt="""
Analyze telecom service data and generate a comprehensive dashboard JSON for UI display.

Extract and structure:
1. Header: provider name, overall status (good/moderate/major issues), star rating, total recent reports
2. Key metrics: top 4-5 KPIs with values, icons, and trend indicators (up/down/stable)
3. Active outages: list with city, reason, time ago, severity (high/medium/low)
4. Problem breakdown: distribution percentages for chart visualization
5. Geographic hotspots: top affected cities with report counts and severity
6. Recent activity: timeline of last 6-8 outages with timestamps
7. Customer sentiment: percentage breakdown, top 3-4 sample complaints
8. Trend analysis: based on chart, is service improving/declining/stable
9. Critical insights: top 3-4 key findings that need attention
10. Recommendations: 2-3 actionable items

Calculate pain_index (0-10):
  pain_index = (0.4 * negative_sentiment%) + (0.3 * internet_issue%) + (0.2 * blackout%) + (0.1 * active_outage_cities/total_cities*100)

Output JSON structure:
{{
  "header": {{
    "provider": "<name>",
    "status": "<good|moderate|major issues>",
    "status_color": "<green|yellow|red>",
    "star_rating": <number>,
    "rating_count": "<formatted>",
    "total_reports_24h": <count>,
    "last_updated": "<timestamp>"
  }},
  "key_metrics": [
    {{
      "title": "<metric name>",
      "value": "<formatted value>",
      "icon": "<emoji>",
      "trend": "<up|down|stable>",
      "trend_value": "<+5% or -2%>"
    }}
  ],
  "active_outages": [
    {{
      "city": "<name>",
      "reason": "<type>",
      "time_ago": "<human readable>",
      "severity": "<high|medium|low>",
      "timestamp": "<ISO>"
    }}
  ],
  "problem_distribution": [
    {{"label": "<type>", "percent": <number>, "color": "<hex>"}}
  ],
  "geographic_hotspots": [
    {{
      "city": "<name>",
      "reports_count": <number>,
      "severity": "<high|medium|low>",
      "top_issue": "<type>"
    }}
  ],
  "recent_activity": [
    {{
      "time": "<human readable>",
      "city": "<name>",
      "issue": "<type>",
      "timestamp": "<ISO>"
    }}
  ],
  "sentiment": {{
    "negative": <percent>,
    "neutral": <percent>,
    "positive": <percent>,
    "samples": [
      {{
        "user": "<name>",
        "text": "<complaint>",
        "tone": "<frustrated|angry|disappointed>",
        "time_ago": "<human readable>"
      }}
    ]
  }},
  "trend_analysis": {{
    "direction": "<improving|declining|stable>",
    "description": "<brief explanation>",
    "chart_insights": "<key findings from chart>"
  }},
  "critical_insights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>"
  ],
  "pain_index": <0-10>,
  "recommendations": [
    "<actionable item 1>",
    "<actionable item 2>"
  ]
}}

Data provided:
{data}

Chart analysis (last 24h trends):
{analysis}

Extract all numbers from actual data. Use timestamps from latest_reports and issues_reports. Calculate trends from chart analysis. Output ONLY valid JSON, no markdown.
"""

import json
import re
import asyncio
import os
import aiohttp
from pathlib import Path
from dotenv import load_dotenv
from webscrapper import scrape_and_save
from imageanalysis_nemotron import analyze_chart_image

load_dotenv()

async def analyze_insights(service_provider: str) -> dict:
    """
    Analyze insights for a service provider and generate dashboard JSON.
    
    Args:
        service_provider: Name of the service provider (e.g., "att", "verizon")
    
    Returns:
        dict: Dashboard JSON result
    """
    data = await scrape_and_save(service_provider)

    try:
        image_url = data["chart"]["image_src"]
        analysis = await analyze_chart_image(image_url)
        analysis_text = analysis["choices"][0]["message"]["content"]
    except (KeyError, TypeError):
        analysis_text = "No chart data available for the last 24 hours."

    api_url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "nvidia/nemotron-nano-9b-v2:free",
        "messages": [
            {
                "role": "user",
                "content": prompt.format(data=json.dumps(data), analysis=analysis_text)
            }
        ]
    }

    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        async with session.post(api_url, headers=headers, json=payload) as response:
            result = await response.json()
            if response.status != 200:
                raise Exception(f"API error: {result}")
            if "choices" not in result or not result["choices"]:
                raise Exception(f"Invalid API response: {result}")
    
    dashboard_content = result["choices"][0]["message"]["content"]
    
    # Remove markdown code block formatting if present
    dashboard_content = re.sub(r'^```(?:json)?\n?', '', dashboard_content)
    dashboard_content = re.sub(r'\n?```$', '', dashboard_content)
    dashboard_content = dashboard_content.strip()
    
    # Save final report
    reports_dir = Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_filename = f"{service_provider.lower()}.json"
    report_path = reports_dir / report_filename
    report_path.write_text(dashboard_content)
    
    return result


async def main():
    service_provider = "att"
    result = await analyze_insights(service_provider)
    
    print("Dashboard:")
    print(result["choices"][0]["message"]["content"])


if __name__ == "__main__":
    asyncio.run(main())
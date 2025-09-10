#!/bin/bash

# GitHub cleanup script
# Replace YOUR_GITHUB_TOKEN with your actual GitHub personal access token
# Replace YOUR_USERNAME with your GitHub username

GITHUB_TOKEN="YOUR_GITHUB_TOKEN"
GITHUB_USERNAME="YOUR_USERNAME"

# List of repositories to delete
repos=(
  "todo-lista-5153324774-1757507609929"
  "calculateur-cnc-5153324774-1757420213594"
  "danxdz/calculateur-cnc-5153324774-1757420213594"
  "chat-5153324774-1757418652027"
  "danxdz/chat-5153324774-1757418652027"
  "blog-5153324774-1757376213509"
  "danxdz/blog-5153324774-1757376213509"
  "weather-dashboard-5153324774-1757421108186"
  "danxdz/weather-dashboard-5153324774-1757421108186"
  "blog-5153324774-1757423166207"
  "danxdz/blog-5153324774-1757423166207"
  "weather-dashboard-5153324774-1757425603124"
  "danxdz/weather-dashboard-5153324774-1757425603124"
  "todo-list-5153324774-1757432073507"
  "danxdz/todo-list-5153324774-1757432073507"
  "todo-list-5153324774-1757428764588"
  "danxdz/todo-list-5153324774-1757428764588"
  "blog-5153324774-1757416943167"
  "danxdz/blog-5153324774-1757416943167"
)

echo "🧹 Starting cleanup of ${#repos[@]} repositories..."
echo "👤 GitHub User: $GITHUB_USERNAME"
echo ""

deleted=0
not_found=0
failed=0

for repo in "${repos[@]}"; do
  # Handle both formats: "repo-name" and "username/repo-name"
  if [[ $repo == *"/"* ]]; then
    full_repo_name="$repo"
  else
    full_repo_name="$GITHUB_USERNAME/$repo"
  fi
  
  echo "🗑️ Deleting repository: $full_repo_name"
  
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$full_repo_name")
  
  if [ "$response" = "204" ]; then
    echo "✅ Successfully deleted: $full_repo_name"
    ((deleted++))
  elif [ "$response" = "404" ]; then
    echo "⚠️ Repository not found: $full_repo_name"
    ((not_found++))
  else
    echo "❌ Failed to delete $full_repo_name: HTTP $response"
    ((failed++))
  fi
  
  # Small delay to avoid rate limiting
  sleep 1
done

echo ""
echo "📊 Cleanup Summary:"
echo "✅ Successfully deleted: $deleted"
echo "⚠️ Not found: $not_found"
echo "❌ Failed: $failed"
echo ""
echo "🎉 Cleanup completed!"
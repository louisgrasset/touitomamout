#!/bin/sh

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")

touitomamout="$script_dir/../dist/index.js"

# For each env file found (except .env.example)
for env in .env*; do
  if [[ $env != *.example ]]; then
    # Extract the variable from the env file
    name=$(grep "INSTANCE_ID=" "$env" | cut -d '=' -f 2)
    execution=$(grep "EXECUTION=" "$env" | cut -d '=' -f 2)
echo name
echo     execution
    if [[ $execution == "manual" ]]; then
      node $touitomamout "$env"
    elif [[ $execution == "pm2" ]]; then
      if [[ $1 == "--update" ]]; then
        pm2 del touitomamout-"$name"
      fi
      pm2 start "$touitomamout" --name touitomamout-"$name" --no-autorestart --cron '*/7 * * * *' -- "$env"
      pm2 save
    else
      echo "Missing execution settings.\n | Please check your '$env' file.\n | EXECUTION value found: '$execution'"
    fi
  fi
done

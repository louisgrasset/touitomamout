#!/bin/sh

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")

touitomamout="$script_dir/../dist/index.js"

# For each env file found (except .env.example)
for env in .env*; do
  if [[ $env != *.example ]]; then
    # Prevent startup with PM2 if the internal DAEMON is set to true. PM2 will handle the cron itself.
    daemon=$(grep "DAEMON=" "$env" | cut -d '=' -f 2)

    if [[ daemon  == "true" ]]; then
      echo "DAEMON is enabled. Disable it before deploying Touitomamout with PM2. Please check your .env file."
      exit 1
    fi

    # Handle the instance name
    name=$(grep "TWITTER_HANDLE=" "$env" | cut -d '=' -f 2)

    if [[ -z $name ]]; then
      echo "No value found for TWITTER_HANDLE in $env. Please check your .env file."
      exit 1
    fi

    # Handle the sync frequency
    frequency=$(grep "SYNC_FREQUENCY_MIN=" "$env" | cut -d '=' -f 2)

    if [[ -z $frequency ]]; then
      echo "No value found for SYNC_FREQUENCY_MIN in $env. Using default value. Please check your .env file."
      frequency=30
    fi

    # If called with --update flag, delete the instance before starting it again
    if [[ $1 == "--update" ]]; then
      pm2 del touitomamout-"$name"
    fi

    pm2 start "$touitomamout" --name touitomamout-"$name" --no-autorestart --cron "*/$frequency * * * *" -- "$env"
    pm2 save
  fi
done

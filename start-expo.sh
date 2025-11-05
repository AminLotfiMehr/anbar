#!/bin/bash
cd /home/$(whoami)/warehouse-app
bunx expo start --web --port 8082 --host 0.0.0.0
